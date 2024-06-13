const Profile = require("../models/Profile");
const Course = require("../models/Course");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const {
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;
    const id = req.user.id;

    if (!contactNumber || !about || !dateOfBirth || !gender) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    await profile.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating profile",
      error: error.message,
    });
  }
};

// TODO: Schedule the delete user task
// TODO: Crown Job
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById({ _id: id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await Profile.findByIdAndDelete({
      _id: user.additionalDetails,
    });

    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      );
    }

    await User.findByIdAndDelete({ _id: id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
