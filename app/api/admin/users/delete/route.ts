import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/r2'
import { logActivity } from '@/lib/activity-log'

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
          },
        },
        reviews: {
          select: { id: true },
        },
        claimedSubmissions: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting admin users for safety
    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === currentUser.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 403 }
      )
    }

    let deletionSummary = {
      userName: userToDelete.name,
      userEmail: userToDelete.email,
      userRole: userToDelete.role,
      submissionsDeleted: 0,
      filesDeleted: 0,
      reviewsDeleted: 0,
      assignmentsUnassigned: 0,
    }

    // Handle CONTRIBUTOR deletion
    if (userToDelete.role === 'CONTRIBUTOR') {
      // Delete all their submission files from storage
      for (const submission of userToDelete.submissions) {
        try {
          await supabaseAdmin.storage
            .from('submissions')
            .remove([submission.fileUrl])
          deletionSummary.filesDeleted++
        } catch (error) {
          console.error(`Failed to delete file ${submission.fileUrl}:`, error)
          // Continue even if file deletion fails
        }
      }

      // Delete all submissions (this will cascade delete reviews)
      const deletedSubmissions = await prisma.submission.deleteMany({
        where: { contributorId: userId },
      })
      deletionSummary.submissionsDeleted = deletedSubmissions.count
    }

    // Handle REVIEWER deletion
    if (userToDelete.role === 'REVIEWER') {
      // Unassign all tasks assigned to this reviewer
      const unassignedTasks = await prisma.submission.updateMany({
        where: { claimedById: userId },
        data: {
          claimedById: null,
          assignedAt: null,
          status: 'PENDING', // Reset to pending so they can be reassigned
        },
      })
      deletionSummary.assignmentsUnassigned = unassignedTasks.count

      // Delete their reviews
      const deletedReviews = await prisma.review.deleteMany({
        where: { reviewerId: userId },
      })
      deletionSummary.reviewsDeleted = deletedReviews.count
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    })

    // Log the activity
    await logActivity({
      action: 'DELETE_USER',
      description: `Admin deleted ${userToDelete.role.toLowerCase()} account: ${userToDelete.name} (${userToDelete.email})`,
      userId: currentUser.userId,
      userName: currentUser.email,
      userRole: currentUser.role,
      targetId: userId,
      targetType: 'user',
      metadata: deletionSummary,
    })

    return NextResponse.json({
      message: 'User account deleted successfully',
      deletionSummary,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user account' },
      { status: 500 }
    )
  }
}
