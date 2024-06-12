const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    let { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are Mandatory" });
    }

    const instructorDetails = await User.findById(userId);

    console.log(instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      });
    }

    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details Not Found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    const tagDetails2 = await Tag.findByIdAndUpdate(
      { _id: tag },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({}).populate("instructor").exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};
