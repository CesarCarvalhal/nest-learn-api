// ./users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {

  @Prop({ unique: true })
  username: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: string;

  @Prop()
  auth_token: string;

  @Prop()
  created_at: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);