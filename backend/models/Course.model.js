import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Development', 'Data Science', 'Design', 'Marketing', 'Business', 'Other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '📚'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  lessons: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    videoUrl: String,
    duration: String,
    order: Number,
    moduleId: {
      type: String,
      required: false
    },
    moduleName: {
      type: String,
      required: false
    },
    resources: [{
      title: String,
      url: String,
      type: String
    }]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  syllabus: {
    type: String,
    default: ''
  },
  prerequisites: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);
