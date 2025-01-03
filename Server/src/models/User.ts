import mongoose from 'mongoose';
import { TherapistModel } from './Therapist';
import { PatientModel } from './Patient';

export interface IUser {
  userId: string;
  userType: 'patient' | 'therapist' | 'admin';
}

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userType: { type: String, required: true, enum: ['patient', 'therapist', 'admin'] }
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);

export class UserService {
  async registerUser(userData: any) {
    const session = await UserModel.startSession();
    session.startTransaction();

    try {
      const user = new UserModel({
        userId: userData.userId,
        userType: userData.userType
      });
      await user.save({ session });

      if (userData.userType === 'patient') {
        const patient = new PatientModel({
          userId: userData.userId,
          personalInfo: userData.personalInfo,
          therapistInfo: userData.patientInfo.therapistInfo,
          toolsPreferences: userData.patientInfo.toolsPreferences
        });
        await patient.save({ session });
      } else {
        const therapist = new TherapistModel({
          userId: userData.userId,
          personalInfo: userData.personalInfo,
          professionalInfo: userData.professionalInfo,
        });
        await therapist.save({ session });
      }

      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


}


