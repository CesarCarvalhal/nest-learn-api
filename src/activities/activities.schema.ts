//activities.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class Activity {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Boolean, default: null })
  isTrue: boolean | null;

  @Prop({ type: [{ text: String, correct: Boolean }] })
  options: { text: string; correct: boolean }[];

  @Prop({ required: true })
  created_at: string;

  @Prop({ required: true })
  created_by: string;

  @Prop({ required: true, type: [String] })
  viewed_by: string[];

  @Prop({ default: '' })
  image: string;
}

export type ActivityDocument = Activity & Document;
export const ActivitySchema = SchemaFactory.createForClass(Activity);