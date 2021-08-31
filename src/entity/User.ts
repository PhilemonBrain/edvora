import { Entity, ObjectIdColumn, ObjectID, Column, BaseEntity } from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";

@Entity()
export class User extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  email: string;

  @Column()
  password: string;
  
  @Column()
  sessionIds: string[] = [] 

  constructor(email: string, password: string) {
    super();
    this.email = email;
    this.password = password;
  }
}
