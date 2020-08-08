const AWS = require("aws-sdk");
const nodeMailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const route = require("express").Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v1: uuidV1 } = require("uuid");
const { check, validationResult } = require("express-validator");
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: "v4",
  region: "eu-west-2"
});

const Product = require("../models/Product");
const isSeller = require("../middlewares/is-seller");
const Seller = require("../models/Seller");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Reviews");
const Category = require("../models/Category");
const isAdmin = require("../middlewares/is-admin");
const auth = require("../middlewares/is-auth");
const Reject = require("../models/Reject");
const Complaint = require("../models/Complaint");

const transporter = nodeMailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);

route.post(
  "/api/seller/register",
  check("firstName")
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      "Please enter your first name with a minimum of three characters"
    ),
  check("lastName")
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      "Please enter your last name with a minimum of three characters"
    ),
  check("email").trim().isEmail().withMessage("Please enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Please enter a password with a minimum of six characters"),
  check("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Please enter a description with a minimum of 20 characters"),
  check("storeName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please enter a store name with 3 or more characters"),
  check("phoneNumber")
    .isNumeric()
    .withMessage("Please enter a valid phone number"),
  check("city").trim().not().isEmpty().withMessage("Please enter a valid city"),
  check("address")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid street address"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        phoneNumber,
        description,
        storeName,
        city,
        address
      } = req.body;
      if (password !== confirmPassword) {
        return res.status(401).send({ message: "Passwords do not match" });
      }
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res
          .status(401)
          .send({ email: "A user with that email already exists" });
      }
      const sellerExists = await Seller.findOne({ email: email.toLowerCase() });
      if (sellerExists) {
        return res
          .status(401)
          .send({ email: "A seller with that email already exists" });
      }
      // **TODO**  CHECK IF EMAIL IS VALID VIA SENDGRID
      const hashedPassword = await bcrypt.hash(password, 12);
      const seller = new Seller({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        description,
        storeName: storeName.toLowerCase(),
        city,
        address
      });
      const token = jwt.sign(
        { _id: seller._id },
        process.env.CONFIRM_EMAIL_JWT,
        {
          expiresIn: "1 hour"
        }
      );
      await seller.save();
      // **TODO** FROM EMAIL TO BE CHANGED
      transporter.sendMail(
        {
          to: email,
          from: "kevinkhalifa911@gmail.com",
          subject: "Email Confirmation",
          html: `<html lang="en">
      <body>
          <h5 style="font-family: Arial, Helvetica, sans-serif;">Confirming Your Email</h5>
          <p style="font-family: Arial, Helvetica, sans-serif;">Please Click
              <a href=${process.env.EMAIL_CONFIRM_REDIRECT}/${token}/seller>here</a> to confirm your email
          </p>
      </body>
      </html>`
        },
        (error, info) => {
          if (error) {
            console.log(error);
          }
          console.log(info);
        }
      );
      res.status(201).send({
        message:
          "An email has been sent to your email address, please check it to confirm your account"
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.post(
  "/api/seller/update/info",
  isSeller,
  check("firstName")
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      "Please enter your first name with a minimum of three characters"
    ),
  check("lastName")
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      "Please enter your last name with a minimum of three characters"
    ),
  check("email").trim().isEmail().withMessage("Please enter a valid email"),
  check("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Please enter a description with a minimum of 20 characters"),
  check("storeName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please enter a store name with 3 or more characters"),
  check("phoneNumber")
    .isNumeric()
    .withMessage("Please enter a valid phone number"),
  check("city").trim().not().isEmpty().withMessage("Please enter a valid city"),
  check("address")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid street address"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const {
        email,
        firstName,
        lastName,
        phoneNumber,
        description,
        storeName,
        city,
        address
      } = req.body;

      const seller = await Seller.findByIdAndUpdate(req.session.user._id, {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phoneNumber,
        description,
        storeName: storeName.toLowerCase(),
        city,
        address
      });

      await seller.save();

      res.status(201).send({
        message: "Updated Successfully"
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/confirm/email/:emailToken/seller", async (req, res) => {
  try {
    const { emailToken } = req.params;
    const decoded = jwt.verify(emailToken, process.env.CONFIRM_EMAIL_JWT);
    if (!decoded._id) {
      return res.status(401).send({ message: "Invalid token" });
    }
    const seller = await Seller.findById(decoded._id);
    if (!seller) {
      return res.status(401).send({ message: "No seller with that email" });
    }
    seller.verified = true;
    await seller.save();
    req.session.seller = seller;
    res.redirect("/confirm/phoneNumber");
  } catch (error) {
    res.status(500).send(error);
  }
});
// CONFIRM PHONE NUMBER
route.post("/api/twilio", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    await client.verify.services(process.env.TWILIO_SID).verifications.create({
      to: `+254${phoneNumber}`,
      channel: "sms"
    });
    req.session.phoneNumber = phoneNumber;
    res.redirect("/api/number/verify");
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get("/api/number/verify", (req, res) => {
  try {
    if (req.session.phoneNumber) {
      return res.send(req.session.phoneNumber);
    }
    res.send({});
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post("/api/twilio/verify", async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!req.session.seller) {
      return res.redirect("/seller/register");
    }
    const data = await client.verify
      .services(process.env.TWILIO_SID)
      .verificationChecks.create({
        to: `+254${phoneNumber}`,
        code
      });
    if (!data.valid) {
      return res.status(401).send({
        message:
          "The Verification code you entered is invalid. Please try again"
      });
    }
    const seller = await Seller.findById(req.session.seller._id);
    if (!seller) {
      return res.redirect("/seller/redirect");
    }
    seller.verifiedPhoneNumber = true;
    await seller.save();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/current_seller", (req, res) => {
  try {
    if (req.session.seller) {
      return res.send(req.session.seller);
    }
    res.send({});
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post(
  "/api/seller/login",
  check("email").trim().isEmail().withMessage("Please enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Your password must be a minimun of six characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { email, password } = req.body;
      const seller = await Seller.findOne({ email });
      if (!seller) {
        return res.status(404).send({ message: "No seller with that email" });
      }
      const isMatch = await bcrypt.compare(password, seller.password);
      if (!isMatch) {
        return res.status(401).send({ message: "Passwords do not match" });
      }
      if (!seller.verifiedPhoneNumber) {
        return res.status(401).send({ message: "Phone number not verified" });
      }

      req.session.user = seller;
      req.session.isLoggedIn = true;
      res.send(seller);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/products/seller/:sellerId", isSeller, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ seller: sellerId }).sort({
      createdAt: -1
    });
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post(
  "/api/product/add/:sellerId",
  check("name").trim().not().isEmpty().withMessage("Please enter a valid name"),
  check("price").isFloat().withMessage("please enter a valid price"),
  check("stockQuantity")
    .isNumeric()
    .withMessage("please enter a valid stock quantity"),
  check("subcategory")
    .trim()
    .not()
    .isEmpty()
    .withMessage("please enter a valid sub category"),
  check("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage(
      "Please enter a valid description with a minimum of 20 characters"
    ),
  check("category")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid category"),
  check("imageUrl")
    .isArray({ min: 1 })
    .withMessage("please enter a valid image url"),
  isSeller,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).send({ message: errors.array()[0].msg });
    }
    try {
      const { sellerId } = req.params;
      const {
        name,
        price,
        stockQuantity,
        subcategory,
        description,
        category,
        imageUrl
      } = req.body;
      let freeShipping = req.body.freeShipping;

      if (freeShipping !== true) {
        freeShipping = false;
      }

      const product = new Product({
        name,
        freeShipping,
        price,
        stockQuantity,
        category,
        subcategory,
        seller: sellerId,
        description,
        imageUrl
      });
      await product.save();
      res.status(201).send(product);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.patch(
  "/api/product/edit/:sellerId/:productId",
  check("name").trim().not().isEmpty().withMessage("Please enter a valid name"),
  check("price").isFloat().withMessage("please enter a valid price"),
  check("stockQuantity")
    .isNumeric()
    .withMessage("please enter a valid stock quantity"),
  check("subcategory")
    .trim()
    .not()
    .isEmpty()
    .withMessage("please enter a valid sub category"),
  check("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage(
      "Please enter a valid description with a minimum of 20 characters"
    ),

  check("category")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid category"),
  check("imageUrl")
    .isArray({ min: 1 })
    .withMessage("please enter a valid image url"),
  isSeller,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { productId, sellerId } = req.params;
      const {
        name,
        price,
        stockQuantity,
        freeShipping,
        category,
        subcategory,
        description,
        imageUrl
      } = req.body;
      const product = await Product.findOne({
        _id: productId,
        seller: sellerId
      });
      product.name = name;
      product.freeShipping = freeShipping;
      product.description = description;
      product.price = price;
      product.category = category;
      product.imageUrl = imageUrl;
      product.stockQuantity = stockQuantity;
      product.subcategory = subcategory;
      await product.save();
      res.send(product);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.delete(
  "/api/product/delete/:sellerId/:productId",
  isSeller,
  async (req, res) => {
    try {
      const { productId, sellerId } = req.params;
      await Product.findOneAndDelete({ _id: productId, seller: sellerId });
      res.send({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.get("/api/seller/orders", isSeller, async (req, res) => {
  try {
    const { user } = req.session;
    if (!user.isSeller) {
      return res.status(401).send({ message: "Not authorized" });
    }
    const test = await Order.aggregate([
      {
        $project: {
          items: 1,
          paymentMethod: 1,
          buyer: 1,
          createdAt: 1,
          delivered: 1,
          cancelled: 1,
          dispatched: 1
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyerUser"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "buyer",
          foreignField: "_id",
          as: "buyerSeller"
        }
      },
      {
        $project: {
          items: 1,
          paymentMethod: 1,
          buyer: 1,
          createdAt: 1,
          buyerUser: 1,
          buyerSeller: 1,
          delivered: 1,
          cancelled: 1,
          dispatched: 1,
          productSellerData: {
            $filter: {
              input: "$productData",
              as: "d",
              cond: { $eq: ["$$d.seller", user._id] }
            }
          }
        }
      },
      {
        $unwind: "$productSellerData"
      },
      {
        $group: {
          _id: "$_id",
          items: { $push: "$items" },
          paymentMethod: {
            $first: "$paymentMethod"
          },
          cancelled: { $first: "$cancelled" },
          delivered: { $first: "$delivered" },
          dispatched: { $first: "$dispatched" },
          buyerSeller: { $first: "$buyerSeller" },
          buyerUser: { $first: "$buyerUser" },
          buyer: { $first: "$buyer" },
          createdAt: { $first: "$createdAt" },
          productSellerData: {
            $push: "$productSellerData"
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.send(test);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/seller/buyer/:buyerId", isSeller, async (req, res) => {
  try {
    const { buyerId } = req.params;
    const buyer = await User.findById(buyerId);
    if (buyer) {
      return res.send(buyer);
    }
    const seller = await Seller.findById(buyerId);
    if (seller) {
      return res.send(seller);
    }

    res.status(404).send({ message: "No Buyer with that ID found" });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get("/api/image/upload", isSeller, async (req, res) => {
  try {
    const key = `${req.session.user._id}/${uuidV1()}.jpeg`;
    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "e-commerce-gig",
        ContentType: "image/jpeg",
        Key: key
      },
      (err, url) => (err ? res.status(401).send(err) : res.send({ key, url }))
    );
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/image/upload/seller/details", auth, async (req, res) => {
  try {
    const key = `${req.session.user._id}/${uuidV1()}.jpeg`;
    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "e-commerce-gig",
        ContentType: "image/jpeg",
        Key: key
      },
      (err, url) => (err ? res.status(401).send(err) : res.send({ key, url }))
    );
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get(`/api/seller/reviews`, isSeller, async (req, res) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "userSeller",
          foreignField: "_id",
          as: "userSeller"
        }
      },
      { $unwind: "$productData" },
      { $match: { "productData.seller": req.session.user._id } },
      {
        $project: {
          rating: 1,
          title: 1,
          body: 1,
          user: 1,
          userSeller: 1,
          order: 1,
          product: 1,
          createdAt: 1,
          "productData.seller": 1,
          "productData.name": 1,
          "productData._id": 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.send(reviews);
  } catch (error) {
    res.status(500).send(error);
  }
});

// DELETE IMAGES FROM S3 AND DB
route.post("/api/images/delete/:productId", isSeller, async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrl } = req.body;
    const productOwner = await Product.findOne({
      _id: productId,
      seller: req.session.user._id
    });
    if (productOwner.imageUrl.length < 2) {
      return res.status(401).send({ message: "Permission denied" });
    }
    if (
      !productOwner ||
      (productOwner && Object.keys(productOwner).length === 0)
    ) {
      return res.status(401).send({ message: "unauthorized" });
    }
    s3.deleteObject(
      {
        Bucket: "e-commerce-gig",
        Key: imageUrl
      },
      (err, data) => (err ? res.status(400).send(err) : console.log(data))
    );
    const modifiedProduct = await Product.findByIdAndUpdate(productId, {
      $pull: { imageUrl }
    });
    res.send(modifiedProduct);
  } catch (error) {
    res.status(500).send(error);
  }
});
// DELETE IMAGES FROM S3 AND DB
route.post("/api/seller/images/delete", auth, async (req, res) => {
  try {
    const { _id } = req.session.user;
    const { imageUrl } = req.body;
    s3.deleteObject(
      {
        Bucket: "e-commerce-gig",
        Key: imageUrl
      },
      (err, data) => (err ? res.status(400).send(err) : console.log(data))
    );
    const modifiedSeller = await Seller.findByIdAndUpdate(_id, {
      $pull: { imageUrl }
    });
    res.send(modifiedSeller);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post(
  "/api/store/seller/imageUrl",
  auth,
  check("imageUrl")
    .not()
    .isEmpty()
    .withMessage("Please choose a valid image url"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { _id } = req.session.user;
      const { imageUrl } = req.body;
      const seller = await Seller.findById(_id);
      seller.imageUrl = [...seller.imageUrl, ...imageUrl];
      await seller.save();
      res.status(200).send({ message: "succees" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/seller/new/orders", auth, isSeller, async (req, res) => {
  try {
    const { _id } = req.session.user;
    // NEW ORDERS
    const newOrders = await Order.aggregate([
      { $match: { delivered: false, cancelled: false, dispatched: false } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "products"
        }
      },
      {
        $project: {
          products: 1,
          totalPrice: 1,
          buyer: 1,
          createdAt: 1
        }
      },
      { $match: { "products.seller": _id } },
      {
        $project: {
          totalPrice: 1,
          buyer: 1,
          createdAt: 1,
          products: {
            $filter: {
              input: "$products",
              as: "p",
              cond: { $eq: ["$$p.seller", _id] }
            }
          }
        }
      },
      { $count: "newOrders" }
    ]);
    // SUCCESSFUL SALES
    const successfulSales = await Order.aggregate([
      { $match: { delivered: true } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "products"
        }
      },
      {
        $project: {
          products: 1,
          totalPrice: 1,
          buyer: 1,
          createdAt: 1
        }
      },
      { $match: { "products.seller": _id } },
      {
        $project: {
          products: {
            $filter: {
              input: "$products",
              as: "p",
              cond: { $eq: ["$$p.seller", _id] }
            }
          }
        }
      },
      { $unwind: "$products" },
      { $group: { _id: null, successfulSales: { $sum: 1 } } }
    ]);
    // QUALITY RATING
    let reviews = await Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $match: {
          "product.seller": _id
        }
      },
      {
        $project: {
          rating: 1,
          product: {
            $filter: {
              input: "$product",
              as: "p",
              cond: { $eq: ["$$p.seller", _id] }
            }
          }
        }
      },
      { $project: { rating: 1 } }
    ]);
    if (reviews.length !== 0) {
      const reviewsCount = reviews.length;
      reviews = reviews
        .map(review => review.rating)
        .reduce((acc, cur) => acc + cur, 0);
      const qualityRating = parseFloat((reviews / reviewsCount).toFixed(2));
      // MONTHS SELLING
      const seller = await Seller.findById(_id);
      let created = new Date(seller.createdAt);
      created = new Date().getTime() - created.getTime();
      created = created / (1000 * 60 * 60 * 24 * 30);
      const monthsSelling = Math.round(created);
      return res.send({
        newOrders: newOrders.length !== 0 ? newOrders[0].newOrders : 0,
        successfulSales:
          successfulSales.length !== 0 ? successfulSales[0].successfulSales : 0,
        qualityRating,
        monthsSelling
      });
    }
    // MONTHS SELLING
    const seller = await Seller.findById(_id);
    let created = new Date(seller.createdAt);
    created = new Date().getTime() - created.getTime();
    created = created / (1000 * 60 * 60 * 24 * 30);
    const monthsSelling = Math.round(created);
    return res.send({
      newOrders: newOrders.length !== 0 ? newOrders[0].newOrders : 0,
      successfulSales:
        successfulSales.length !== 0 ? successfulSales[0].successfulSales : 0,
      qualityRating: 0,
      monthsSelling
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/seller/product/rejects", auth, isSeller, async (req, res) => {
  try {
    const { _id } = req.session.user;
    const rejects = await Reject.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "sellers",
          localField: "product.seller",
          foreignField: "_id",
          as: "seller"
        }
      },
      {
        $unwind: "$seller"
      },
      {
        $match: {
          "seller._id": _id
        }
      },
      {
        $project: {
          body: 1,
          createdAt: 1,
          name: "$product.name",
          productId: "$product._id"
        }
      }
    ]);
    res.send(rejects);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.delete(
  "/api/seller/product/delete/:productId",
  auth,
  isSeller,
  async (req, res) => {
    try {
      const { _id } = req.session.user;
      await Product.findOneAndDelete({
        _id: req.params.productId,
        seller: _id
      });
      res.send({ message: "Success :)" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
// SECURE THIS ROUTE LATER
route.get("/api/root/admin/stock/report", auth, isAdmin, async (req, res) => {
  try {
    const stockQuantity = await Product.aggregate([
      { $project: { stockQuantity: 1, _id: 0 } }
    ]);
    const sOut = await Order.aggregate([
      { $project: { "items.quantity": 1, _id: 0 } },
      { $unwind: "$items" },
      { $project: { quantity: "$items.quantity" } }
    ]);
    const stockIn = stockQuantity
      .map(s => s.stockQuantity)
      .reduce((acc, cur) => acc + cur, 0);
    const stockOut = sOut
      .map(s => s.quantity)
      .reduce((acc, cur) => acc + cur, 0);
    res.send({ stockIn, stockOut });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/verified/sellers", auth, isAdmin, async (req, res) => {
  try {
    const verifiedSellers = await Seller.find({ isSeller: true });
    res.send({ verifiedSellers });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/verified/seller/:sellerId", auth, isAdmin, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId);
    if (!seller || Object.keys(seller).length === 0) {
      return res.status(404).send({ message: "No seller found" });
    }
    res.send(seller);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/new/sellers", auth, isAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({ isSeller: false });
    res.send({ sellers });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/new/seller/:sellerId", auth, isAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);
    if (!seller || Object.keys(seller).length === 0) {
      return res.status(404).send({ message: "No seller found" });
    }
    res.send(seller);
  } catch (error) {
    res.status(500).send(error);
  }
});
// FETCH ALL ORDERS COUNT AND TODAY COUNT
route.get("/api/root/admin/orders", auth, isAdmin, async (req, res) => {
  try {
    const totalOrdersCount = await Order.find({}).estimatedDocumentCount();
    const todaysOrdersCount = await Order.aggregate([
      {
        $match: {
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(
              Date.now() / 1000 - 24 * 60 * 60
            )
          }
        }
      },
      { $count: "todaysOrders" }
    ]);
    // { $unwind: "$items" },
    // { $project: { quantity: "$items.quantity" } },
    // { $group: { _id: null, quantity: { $sum: "$quantity" } } },
    // { $project: { _id: 0, quantity: 1 } }
    const totalPrice = await Order.aggregate([
      { $project: { _id: 0, totalPrice: 1 } },
      { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } }
    ]);
    const todayTotalPrice = await Order.aggregate([
      {
        $match: {
          paid: true,
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(
              Date.now() / 1000 - 24 * 60 * 60
            )
          }
        }
      },
      { $project: { _id: 0, totalPrice: 1 } },
      { $group: { _id: null, todayTotalPrice: { $sum: "$totalPrice" } } }
    ]);
    const monthlyPrice = await Order.aggregate([
      {
        $match: {
          paid: true,
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(
              Date.now() / 1000 - 24 * 60 * 60 * 30
            )
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalPrice: 1
        }
      },
      { $group: { _id: null, monthlyPrice: { $sum: "$totalPrice" } } }
    ]);
    const totalProducts = await Product.find({}).estimatedDocumentCount();
    res.send({
      totalOrdersCount,
      todaysOrdersCount,
      totalPrice: totalPrice[0].totalPrice,
      todayTotalPrice: todayTotalPrice[0]
        ? todayTotalPrice[0].todayTotalPrice
        : 0,
      monthlyPrice:
        monthlyPrice[0] && monthlyPrice[0].monthlyPrice
          ? monthlyPrice[0].monthlyPrice
          : 0,
      totalProducts
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// FETCH PENDING ORDERS COUNT
route.get("/api/root/admin/pending/orders", auth, isAdmin, async (req, res) => {
  try {
    const pendingOrders = await Order.aggregate([
      { $match: { delivered: false, paid: true, dispatched: true } },
      { $count: "pendingOrders" }
    ]);
    const todaysPendingOrders = await Order.aggregate([
      {
        $match: {
          delivered: false,
          paid: true,
          dispatched: true,
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(
              Date.now() / 1000 - 24 * 60 * 60
            )
          }
        }
      },
      { $count: "todaysPendingOrders" }
    ]);

    res.send({
      pendingOrders: pendingOrders[0]
        ? pendingOrders[0].pendingOrders
        : pendingOrders,
      todaysPendingOrders: todaysPendingOrders[0]
        ? todaysPendingOrders[0].todaysPendingOrders
        : todaysPendingOrders
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// FETCH ALL ORDERS
route.post("/api/root/admin/all/orders", auth, isAdmin, async (req, res) => {
  try {
    const { itemsToSkip, test } = req.body;

    if (!test) {
      const orders = await Order.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: itemsToSkip },
        { $limit: 5 }
      ]);
      const ordersCount = await Order.aggregate([{ $count: "ordersCount" }]);
      return res.send({
        orders,
        ordersCount: ordersCount.length !== 0 ? ordersCount[0].ordersCount : 0
      });
    }
    if (typeof test === "object" && Object.keys(test).length !== 0) {
      const orders = await Order.aggregate([
        { $match: test },
        { $sort: { createdAt: -1 } },
        { $skip: itemsToSkip },
        { $limit: 5 }
      ]);

      const ordersCount = await Order.aggregate([
        { $match: test },
        { $count: "ordersCount" }
      ]);
      return res.send({
        orders,
        ordersCount: ordersCount.length !== 0 ? ordersCount[0].ordersCount : 0
      });
    }
    const orders = await Order.aggregate([
      {
        $match: {
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(test / 1000)
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: itemsToSkip },
      { $limit: 5 }
    ]);

    const ordersCount = await Order.aggregate([
      {
        $match: {
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(test / 1000)
          }
        }
      },
      { $count: "ordersCount" }
    ]);

    res.send({
      orders,
      ordersCount: ordersCount.length !== 0 ? ordersCount[0].ordersCount : 0
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/root/admin/order/:orderId", auth, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const buyer = await Order.findById(orderId)
      .populate("buyer buyerSeller")
      .select({ buyer: 1, buyerSeller: 1, _id: 0 });
    const order = await Order.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(orderId) } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "product.seller",
          foreignField: "_id",
          as: "seller"
        }
      }
    ]);
    res.send({
      ...order,
      buyer: buyer.buyer ? buyer.buyer : buyer.buyerSeller
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get(
  "/api/admin/fetch/order/by/id/:orderId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(orderId) } },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $lookup: {
            from: "sellers",
            localField: "product.seller",
            foreignField: "_id",
            as: "seller"
          }
        }
      ]);
      res.send(order.length !== 0 ? order[0] : order);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/fetch/weekly/sales", auth, isAdmin, async (req, res) => {
  try {
    const items = await Order.aggregate([
      {
        $match: {
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(
              Date.now() / 1000 - 24 * 60 * 60 * 6
            )
          }
        }
      },
      { $project: { "items.quantity": 1, _id: 0, createdAt: 1 } }
    ]);
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post(
  "/api/root/admin/add/new/category",
  check("category.main")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid main"),
  check("category.icon")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid icon"),
  check("category.subcategories")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid subcategory"),
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { category } = req.body;
      const newCategory = new Category({
        category
      });
      await newCategory.save();
      res.send(newCategory);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.patch(
  "/api/root/admin/edit/category/:categoryId",
  check("category.main")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid main"),
  check("category.subcategories")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid subcategory"),
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { category } = req.body;
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.categoryId,
        { category }
      );
      await updatedCategory.save();
      res.send(updatedCategory);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/root/admin/fetch/all/categories", auth, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get("/api/seller/all/categories", auth, isSeller, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get(
  "/api/root/admin/category/:categoryId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.categoryId);
      res.send(category);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.post(
  "/api/accept/seller/request/:sellerId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const { sellerId } = req.params;
      const seller = await Seller.findByIdAndUpdate(sellerId, {
        isSeller: true
      });
      res.send(seller);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/root/admin/new/products", auth, isAdmin, async (req, res) => {
  try {
    const products = await Product.find({ underReview: true })
      .populate("seller")
      .exec();
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get(
  "/api/root/admin/review/product/:productId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId)
        .populate("seller")
        .exec();
      res.send(product);
    } catch (error) {
      res.status(error).send(error);
    }
  }
);
// CHANGE UNDERREVIEW TO FALSE
// CHANGE REJECTED TO TRUE OR FALSE
// MODIFY PRODUCTS ON SITE
route.post(
  "/api/root/admin/accept/product/:productId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId);
      product.underReview = false;
      product.onSite = true;
      await product.save();
      res.send(product);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.post(
  "/api/root/admin/reject/product/:productId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId);
      product.underReview = false;
      product.rejected = true;
      await product.save();
      res.send(product);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.post(
  "/api/root/reject/message",
  auth,
  isAdmin,
  check("productId").not().isEmpty().withMessage("please enter a valid ID"),
  check("message").not().isEmpty().withMessage("body must not be empty"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { productId, message } = req.body;
      const reject = new Reject({
        product: productId,
        body: message
      });
      await reject.save();
      res.send(reject);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
// COMPLAINTS COUNT
route.get("/api/complaints/count", auth, isAdmin, async (req, res) => {
  try {
    const todaysComplaints = await Complaint.aggregate([
      {
        $match: {
          _id: {
            $gt: mongoose.Types.ObjectId.createFromTime(
              Date.now() / 1000 - 24 * 60 * 60
            )
          }
        }
      },
      { $count: "todaysComplaints" }
    ]);
    const totalComplaints = await Complaint.find({}).estimatedDocumentCount();
    res.send({
      todaysComplaints: todaysComplaints[0]
        ? todaysComplaints[0].todaysComplaints
        : 0,
      totalComplaints
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
// ACTUAL COMPLAINTS
route.get("/api/root/admin/complaints", auth, isAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer"
        }
      },
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "order"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "buyerSeller",
          foreignField: "_id",
          as: "buyer"
        }
      },
      { $unwind: "$order" },
      {
        $project: {
          product: 1,
          body: 1,
          buyer: 1,
          items: {
            $filter: {
              input: "$order.items",
              as: "i",
              cond: { $eq: ["$$i.product", "$product"] }
            }
          }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "sellers",
          localField: "product.seller",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: "$seller" },
      { $unwind: "$buyer" },
      {
        $project: {
          buyerFirstName: "$buyer.firstName",
          buyerLastName: "$buyer.lastName",
          buyerPhoneNumber: "$buyer.phoneNumber",
          sellerFirstName: "$seller.firstName",
          sellerLastName: "$seller.lastName",
          sellerPhoneNumber: "$seller.phoneNumber",
          sellerEmail: "$seller.email",
          sellerId: "$seller._id",
          productName: "$product.name",
          productPrice: "$product.price",
          quantityOrdered: "$items.quantity",
          imageUrl: "$product.imageUrl"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.send(complaints);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.get(
  "/api/root/admin/complaint/:complaintId",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const complaint = await Complaint.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.complaintId) } },
        {
          $lookup: {
            from: "users",
            localField: "buyer",
            foreignField: "_id",
            as: "buyer"
          }
        },
        {
          $lookup: {
            from: "orders",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        {
          $lookup: {
            from: "sellers",
            localField: "buyerSeller",
            foreignField: "_id",
            as: "buyer"
          }
        },
        { $unwind: "$order" },
        {
          $project: {
            product: 1,
            body: 1,
            buyer: 1,
            items: {
              $filter: {
                input: "$order.items",
                as: "i",
                cond: { $eq: ["$$i.product", "$product"] }
              }
            }
          }
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "sellers",
            localField: "product.seller",
            foreignField: "_id",
            as: "seller"
          }
        },
        { $unwind: "$seller" },
        { $unwind: "$buyer" },
        {
          $project: {
            buyerFirstName: "$buyer.firstName",
            buyerLastName: "$buyer.lastName",
            buyerPhoneNumber: "$buyer.phoneNumber",
            sellerFirstName: "$seller.firstName",
            sellerLastName: "$seller.lastName",
            sellerPhoneNumber: "$seller.phoneNumber",
            sellerEmail: "$seller.email",
            sellerId: "$seller._id",
            productName: "$product.name",
            productPrice: "$product.price",
            quantityOrdered: "$items.quantity",
            imageUrl: "$product.imageUrl",
            body: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
      res.send({ complaint: complaint[0] ? complaint[0] : {} });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.get(
  "/api/root/admin/fetch/rejected/products",
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const rejectedProducts = await Reject.aggregate([
        { $project: { product: 1, body: 1, createdAt: 1 } },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "sellers",
            localField: "product.seller",
            foreignField: "_id",
            as: "seller"
          }
        },
        { $unwind: "$seller" },
        {
          $project: {
            body: 1,
            createdAt: 1,
            imageUrl: "$product.imageUrl",
            productName: "$product.name",
            sellerFirstName: "$seller.firstName",
            sellerLastName: "$seller.lastName",
            sellerId: "$seller._id"
          }
        }
      ]);
      res.send(rejectedProducts);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/latest/rejected/products", auth, isAdmin, async (req, res) => {
  try {
    const latestRejects = await Reject.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "sellers",
          localField: "product.seller",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: "$seller" },
      {
        $project: {
          imageUrl: "$product.imageUrl",
          name: "$product.name",
          sellerFirstName: "$seller.firstName",
          sellerLastName: "$seller.lastName",
          sellerId: "$seller._id",
          body: 1
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      { $limit: 3 }
    ]);
    res.send(latestRejects);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post(
  "/api/confirm/seller/dispatch",
  isSeller,
  check("productId").not().isEmpty(),
  check("orderId").not().isEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { productId, orderId } = req.body;
      const order = await Order.findOneAndUpdate(
        { _id: orderId, "items.product": productId },
        { "items.$.sellerDispatched": true }
      );
      await order.save();

      const falseItem = order.items.find(item => !item.sellerDispatched);
      if (falseItem) {
        return res.send(order);
      }
      const updatedOrder = await Order.findByIdAndUpdate(orderId, {
        dispatched: true
      });
      res.send(updatedOrder);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.post(
  "/api/confirm/admin/delivery",
  auth,
  isAdmin,
  check("orderId").not().isEmpty().withMessage("Please enter a valid order id"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send({ message: errors.array()[0].msg });
      }
      const { orderId } = req.body;
      const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { delivered: true }
      );
      res.send(order);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
module.exports = route;
