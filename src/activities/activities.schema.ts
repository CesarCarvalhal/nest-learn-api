import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';


@Schema()
export class Activity {
  @Prop({ required: true })
  @ApiProperty({
    example: 'Titulo de la actividad',
  })
  title: string;

  @Prop({ default: '' })
  @ApiProperty({
    example: 'Descripcion de la actividad',
  })
  description: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'Multiple options',
  })
  type: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'Contenido de la actividad',
  })
  content: string;

  @Prop({ type: Boolean, default: null })
  @ApiProperty({
    example: true,
  })
  isTrue: boolean | null;

  @Prop({ type: [{ text: String, correct: Boolean }] })
  @ApiProperty({
    example: [
      { text: 'Option A', correct: true },
      { text: 'Option B', correct: false },
    ],
  })
  options: { text: string; correct: boolean }[];

  @Prop({ required: true })
  @ApiProperty({
    example: '1683714418232',
  })
  created_at: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'auth0|64479d486f7ef1ea7854bcab',
  })
  created_by: string;

  @Prop({ required: true, type: [String] })
  @ApiProperty({
    example: ['auth0|64479d486f7ef1ea7854bcab', 'auth0|6448fa391cc0b0a6d414d1bf'],
  })
  viewed_by: string[];

  @Prop({ default: '' })
  @ApiProperty({
    example: 'https://example.com/image.png',
  })
  image: string;
}

export type ActivityDocument = Activity & Document;
export const ActivitySchema = SchemaFactory.createForClass(Activity);
