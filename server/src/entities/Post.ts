import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ default: "" })
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @Field(() => String)
  @Column()
  title!: string;
}