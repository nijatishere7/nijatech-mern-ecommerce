// Packages
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Models
import User from "../models/user.model.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Bu email artıq istifadə olunur" });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar ? user.avatar : "",
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email və ya şifrə yanlışdır" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
    });
  } else {
    res.status(404).json({ message: "İstifadəçi tapılmadı" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "Bu email ilə istifadəçi tapılmadı" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      subject: "Nijatech - Şifrə Yeniləmə",
      html: `<h4>Şifrənizi yeniləmək üçün aşağıdakı linkə daxil olun:</h4>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>Bu link 1 saat ərzində qüvvədədir.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "Bərpa linki göndərildi" });
  } catch (error) {
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Email göndərilərkən xəta baş verdi" });
    }
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Token yanlışdır və ya vaxtı bitib" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Şifrəniz uğurla yeniləndi" });
  } catch (error) {
    res.status(500).json({ message: "Şifrə yenilənərkən xəta" });
  }
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: "Cari şifrəni daxil edin" });
      }

      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Cari şifrə yanlışdır" });
      }

      user.password = req.body.password;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      avatar: user.avatar,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "İstifadəçi tapılmadı" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: "Hesab uğurla silindi" });
    } else {
      res.status(404).json({ message: "İstifadəçi tapılmadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Şəkil faylı tapılmadı" });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      const imageUrl = req.file.path || req.file.secure_url;

      user.avatar = imageUrl;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: "İstifadəçi tapılmadı" });
    }
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Server xətası: " + error.message });
  }
};
