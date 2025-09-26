import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', select: false })
  password: string;

  @Column({ type: 'text' })
  fullName: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @Column({ type: 'text', array: true, default: ['user'] })
  roles: string[];

  @BeforeInsert()
  async checkFilesBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  async checkFilesBeforeUpdate() {
    this.password = await bcrypt.hash(this.password, 10);
    this.email = this.email.toLowerCase().trim();
  }
}
