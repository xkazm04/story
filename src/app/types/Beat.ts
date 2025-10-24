export type Beat = {
    id: string;
    act_id?: string;
    project_id?: string;
    name: string;
    type: string;
    order?: number;
    description?: string;
    paragraph_id?: string;
    paragraph_title?: string;
    completed: boolean;
    created_at: Date;
    updated_at?: Date;
    default_flag?: boolean;
};

