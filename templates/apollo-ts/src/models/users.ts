import { Schema, model, Document } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    verify_password: (password: string) => Promise<boolean>;
}

export const userSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        unique: true,
        minlength: 3,
        required: true
    },
    email: {
        type: String,
        unique: true,
        minlength: 3,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    // @ts-ignore
    const passwordHash = await hash(this.password, 10);

    // @ts-ignore
    this.password = passwordHash;
    next();
});

userSchema.methods.verify_password = function(password: string) {
    return compare(password, this.password);
};

export default model<IUser>('User', userSchema);
