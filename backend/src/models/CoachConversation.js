import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user","assistant"],
        required: true,
    },

    content: {
        type: String,
        required: true,
        trim : true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
},
{
    _id: true,
}
);

const coachConversationSchema = new mongoose.Schema(
    {
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        messages: {
            type: [messageSchema],
            default: [],
        },

        lastInteractionAt : {
            type: Date,
            default: Date.now,
        },
        
    }
    ,
    {timestamps: true}
);

const coachConversation = mongoose.model("CoachConversation",coachConversationSchema);

export default coachConversation;
