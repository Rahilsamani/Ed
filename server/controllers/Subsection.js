const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const video = req.files.video;

    if (!sectionId || !title || !description || !video) {
      return res
        .status(404)
        .json({ success: false, message: "All Fields are Required" });
    }

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
