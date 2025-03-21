import { JobEvent, JobStatus, Job } from '@/services/api/auto';

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
}

export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
    } else if (minutes < 60) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else if (hours < 24) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days < 7) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else {
        return formatDate(dateString);
    }
}

export const getStatusColor = (status: JobStatus) => {
    switch (status) {
        case 'CANCELED':
            return '#F87171';
        case 'FINISHED':
            return '#10B981';
        case 'PAUSED':
            return '#F59E0B';
        case 'IN_PROGRESS':
            return '#3B82F6';
        case 'CREATED':
            return '#3B82F6';
        default:
            return '#3B82F6';
    }
};

export const getStatusText = (status: JobStatus) => {
    switch (status) {
        case 'CANCELED':
            return 'Canceled';
        case 'FINISHED':
            return 'Finished';
        case 'PAUSED':
            return 'Paused';
        case 'IN_PROGRESS':
            return 'In Progress';
        case 'CREATED':
            return 'Created';
        default:
            return 'Unknown';
    }
};

export const getEventColor = (eventType: JobEvent['eventType']) => {
    switch (eventType) {
        case 'FINISHED':
            return '#10B981';
        case 'STEP_DONE':
            return '#10B981';
        case 'CREATED':
            return '#3B82F6';
        case 'RESUMED':
            return '#3B82F6';
        case 'PAUSED':
            return '#F59E0B';
        case 'CANCELED_ORDERS':
            return '#F87171';
        case 'STOPPED':
            return '#F87171';
        default:
            return '#748CAB';
    }
};

export const getEventText = (eventType: JobEvent['eventType']) => {
    switch (eventType) {
        case 'FINISHED':
            return 'Completed';
        case 'STEP_DONE':
            return 'Step Complete';
        case 'CREATED':
            return 'Created';
        case 'RESUMED':
            return 'Resumed';
        case 'PAUSED':
            return 'Paused';
        case 'CANCELED_ORDERS':
            return 'Canceled Orders';
        case 'STOPPED':
            return 'Stopped';
        default:
            return 'Unknown';
    }
};

export const getEventDescription = (event: JobEvent): string => {
    switch (event.eventType) {
        case 'CREATED':
            return 'Job was created';
        case 'PAUSED':
            return 'Job was paused';
        case 'RESUMED':
            return 'Job was resumed';
        case 'STEP_DONE':
            return `Step ${event.stepsDone} completed`;
        case 'CANCELED_ORDERS':
            return 'Orders were canceled';
        case 'STOPPED':
            return 'Job was stopped manually';
        case 'FINISHED':
            return 'Job finished successfully';
        default:
            return 'Event occurred';
    }
};

export function calculateRemainingTime(job: Job): string {
    const minutesPerStep = job.durationMinutes / job.stepsTotal;
    const remainingSteps = job.stepsTotal - job.stepsDone;
    const remainingMinutes = Math.round(remainingSteps * minutesPerStep);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;

    return remainingHours > 0
        ? `${remainingHours}h ${remainingMins}m remaining`
        : `${remainingMins}m remaining`;
} 