import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  timeIn: {type: Date, default: Date.now},
  timeOut: {type: Date},
  status: {type: String, enum: ['Present', 'Exited'], default: 'Present'},
  entryLocation: {lat: Number, lng: Number},
  exitLocation: {lat: Number, lng: Number}
});

export default mongoose.model('Attendance', attendanceSchema);
