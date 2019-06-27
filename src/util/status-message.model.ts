export interface StatusMessage {
    status: 'Complete' | 'Failed' | 'In Progress' | 'Pending';
    message?: string;
}
