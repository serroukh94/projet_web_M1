import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => ID)
  id: string; // <--- Ce champ sera automatiquement mappé sur _id via le virtual plus bas

  @Prop({ required: true, unique: true })
  @Field()
  username: string;

  @Field()
  createdAt: Date; // auto-map via timestamps
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.virtual('id').get(function (this: any) {
  // "this" est le doc Mongo, ._id c'est le vrai id Mongo
  return this._id?.toHexString ? this._id.toHexString() : this._id;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

