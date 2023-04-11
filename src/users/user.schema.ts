// ./users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ unique: true, required: true, match: /.+\@.+\..+/ })
  email: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  created_at: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);