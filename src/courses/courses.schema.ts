// courses.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';


@Schema()
export class Course {
  @Prop({ required: true })
  @ApiProperty({ example: 'Titulo del curso' })
  title: string;

  @Prop({ default: '' })
  @ApiProperty({ example: 'Descripcion del curso' })
  description: string;

  @Prop({ required: true, type: [String] })
  @ApiProperty({ example: ['645b71720683dd48740ebc49', '6454effd6f767348fb1e6e23'] })
  activities: string[];

  @Prop({ required: true })
  @ApiProperty({ example: '1683718080135' })
  created_at: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'auth0|643e9d635ec699cf64af3204' })
  created_by: string;

  @Prop({ default: '' })
  @ApiProperty({ example: 'https://example.com/image.png' })
  image: string;
}

export type CourseDocument = Course & Document;
export const CourseSchema = SchemaFactory.createForClass(Course);