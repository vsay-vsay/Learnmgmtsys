import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
    title: string;
    description: string;
    price: number;
    thumbnail?: {
        public_id: string;
        url: string;
    };
    tags: string[];
    level: string;
    demoUrl: string;
    videoUrl: string;
    videoThumbnail: string;
    videoSection: string;
    videoLength: number;
    totalVideos: number;
    numberOfLectures: number;
    tutor: {
        _id: string;
        name: string;
    };
    ratings?: number;
    reviews: Array<{
        user: object;
        rating: number;
        comment: string;
        commentReplies?: Array<{
            user: object;
            comment: string;
        }>;
    }>;
    purchased?: number;
}

const courseSchema = new Schema<ICourse>({
    title: {
        type: String,
        required: [true, "Please enter course title"],
        minLength: [4, "Title must be at least 4 characters"],
        maxLength: [80, "Title cannot exceed 80 characters"]
    },
    description: {
        type: String,
        required: [true, "Please enter course description"],
        minLength: [20, "Description must be at least 20 characters"]
    },
    price: {
        type: Number,
        required: [true, "Please enter course price"]
    },
    thumbnail: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    tags: {
        type: [String],
        required: [true, "Please enter course tags"]
    },
    level: {
                type: String,
        required: [true, "Please enter course level"]
    },
    demoUrl: {
        type: String,
        required: [true, "Please enter demo URL"]
    },
    videoUrl: {
        type: String,
        required: [true, "Please enter video URL"]
    },
    videoThumbnail: String,
    videoSection: String,
    videoLength: Number,
    totalVideos: {
        type: Number,
        default: 0
    },
    numberOfLectures: {
        type: Number,
        default: 0
    },
    tutor: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    ratings: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: Object
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            commentReplies: [
                {
                    user: {
                        type: Object
                    },
                    comment: {
                        type: String
                    }
                }
            ]
        }
    ],
    purchased: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
// Add text indexes for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
export default mongoose.model<ICourse>("Course", courseSchema);
