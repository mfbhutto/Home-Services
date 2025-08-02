import Notification from "./models/Notification"

export async function createNotification({
  recipient,
  sender,
  booking,
  type,
  title,
  message,
  actionUrl = null
}) {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      booking,
      type,
      title,
      message,
      actionUrl
    })

    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function createBookingNotifications(booking, action) {
  try {
    const notifications = []

    switch (action) {
      case "created":
        // Notify service provider about new booking
        notifications.push(
          createNotification({
            recipient: booking.provider,
            sender: booking.client,
            booking: booking._id,
            type: "booking_created",
            title: "New Booking Request",
            message: `You have received a new booking request for ${booking.service.title}`,
            actionUrl: `/dashboard`
          })
        )
        break

      case "confirmed":
        // Notify client about booking confirmation
        notifications.push(
          createNotification({
            recipient: booking.client,
            sender: booking.provider,
            booking: booking._id,
            type: "booking_confirmed",
            title: "Booking Confirmed",
            message: `Your booking for ${booking.service.title} has been confirmed by ${booking.provider.name}`,
            actionUrl: `/dashboard`
          })
        )
        break

      case "rejected":
        // Notify client about booking rejection
        notifications.push(
          createNotification({
            recipient: booking.client,
            sender: booking.provider,
            booking: booking._id,
            type: "booking_rejected",
            title: "Booking Rejected",
            message: `Your booking for ${booking.service.title} has been rejected by ${booking.provider.name}`,
            actionUrl: `/dashboard`
          })
        )
        break

      case "completed":
        // Notify client about booking completion
        notifications.push(
          createNotification({
            recipient: booking.client,
            sender: booking.provider,
            booking: booking._id,
            type: "booking_completed",
            title: "Service Completed",
            message: `Your booking for ${booking.service.title} has been completed by ${booking.provider.name}`,
            actionUrl: `/dashboard`
          })
        )
        break
    }

    await Promise.all(notifications)
  } catch (error) {
    console.error("Error creating booking notifications:", error)
    // Don't throw error to avoid breaking the main booking flow
  }
} 