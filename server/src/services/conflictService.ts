import prisma from '../prisma/client';

interface ConflictCheckParams {
  authorityId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM (24-hour)
  durationMinutes: number;
  excludeAppointmentId?: string;
}

interface ConflictResult {
  hasConflict: boolean;
  reason?: string;
  conflictingAppointment?: {
    referenceNo: string;
    scheduledTime: string;
    durationMinutes: number;
  };
}

export class ConflictService {
  /**
   * Converts HH:MM string to minutes since midnight for accurate interval math
   */
  private static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Checks whether the scheduled time is within the authority's declared visiting hours
   */
  public static async validateVisitingHours(
    authorityId: string,
    scheduledDate: string,
    scheduledTime: string,
    durationMinutes: number
  ): Promise<{ valid: boolean; message?: string }> {
    const authority = await prisma.authority.findUnique({
      where: { id: authorityId }
    });

    if (!authority) {
      return { valid: false, message: 'Authority not found' };
    }

    if (!authority.isAcceptingAppointments) {
      return { valid: false, message: 'This authority is currently not accepting appointments' };
    }

    try {
      const schedule = JSON.parse(authority.visitingHours);
      // Determine day of week
      const dateObj = new Date(scheduledDate);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = days[dateObj.getDay()];

      if (schedule.days && Array.isArray(schedule.days)) {
        const allowedDays = schedule.days.map((d: string) => d.toLowerCase());
        if (!allowedDays.includes(dayName)) {
          return {
            valid: false,
            message: `${authority.name} does not have visiting hours on ${dayName.toUpperCase()}. Allowed days: ${schedule.days.join(', ')}`
          };
        }
      }

      if (schedule.startTime && schedule.endTime) {
        const requestedStart = this.timeToMinutes(scheduledTime);
        const requestedEnd = requestedStart + durationMinutes;
        const windowStart = this.timeToMinutes(schedule.startTime);
        const windowEnd = this.timeToMinutes(schedule.endTime);

        if (requestedStart < windowStart || requestedEnd > windowEnd) {
          return {
            valid: false,
            message: `Selected time (${scheduledTime}) is outside regular visiting hours (${schedule.startTime} - ${schedule.endTime})`
          };
        }
      }

      return { valid: true };
    } catch (e) {
      // If schedule JSON parsing fails or custom format, permit as soft check
      return { valid: true };
    }
  }

  /**
   * Detects appointment overlaps (Double-Booking Prevention)
   */
  public static async checkConflict({
    authorityId,
    scheduledDate,
    scheduledTime,
    durationMinutes,
    excludeAppointmentId
  }: ConflictCheckParams): Promise<ConflictResult> {
    const newStart = this.timeToMinutes(scheduledTime);
    const newEnd = newStart + durationMinutes;

    // Fetch existing ACCEPTED or RESCHEDULED appointments for this authority on that date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        authorityId,
        scheduledDate,
        status: { in: ['ACCEPTED', 'RESCHEDULED'] },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {})
      }
    });

    for (const appt of existingAppointments) {
      if (appt.scheduledTime) {
        const apptStart = this.timeToMinutes(appt.scheduledTime);
        const apptEnd = apptStart + (appt.durationMinutes || 15);

        // Check if intervals overlap: [newStart, newEnd) overlaps with [apptStart, apptEnd)
        // Two intervals [A, B) and [C, D) overlap if max(A, C) < min(B, D)
        if (Math.max(newStart, apptStart) < Math.min(newEnd, apptEnd)) {
          return {
            hasConflict: true,
            reason: `Double booking detected: Authority already has an appointment (${appt.referenceNo}) scheduled from ${appt.scheduledTime} for ${appt.durationMinutes} minutes.`,
            conflictingAppointment: {
              referenceNo: appt.referenceNo,
              scheduledTime: appt.scheduledTime,
              durationMinutes: appt.durationMinutes
            }
          };
        }
      }
    }

    return { hasConflict: false };
  }
}
