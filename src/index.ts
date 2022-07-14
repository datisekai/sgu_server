import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import cheerio from "cheerio";
import student from "./models/student";

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
dotenv.config();

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.get("/", (req, res) => {
  res.send("Hello, This is server of datisekai");
});

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://datisekai:bedatnee312@infosv-db.9xmuf.mongodb.net/?retryWrites=true&w=majority`
    );

    console.log("MongoDB connected!");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

connectDB();

//get all thong tin

interface thong_tin_sv {
  mssv?: string;
  ho_ten_ngay_sinh?: string;
  ngay_sinh?: string;
  lop_nganh_khoa?: string;
}

interface mon_hoc {
  ma_mh: string;
  ten_mh: string;
  nhom_mh: string;
  ma_lop: string;
  stchp: string;
  kdk: string;
  th: string;
}

app.get("/v1", async (req, res) => {
  const mssv = req.query.mssv;
  if (!mssv) {
    return res.status(404).json("Mssv???");
  }
  const tkb = `${process.env.BASE_URL}?page=thoikhoabieu&sta=1&id=${mssv}`;
  const html = await axios(tkb);
  let hoc_ki = "";
  let thong_tin: thong_tin_sv = {};
  let data_tkb = [];
  const $ = cheerio.load(html.data);
  $("#ctl00_ContentPlaceHolder1_ctl00_ddlChonNHHK > option").each(function () {
    hoc_ki = $(this).text();
  });

  thong_tin.mssv = $("#ctl00_ContentPlaceHolder1_ctl00_lblContentMaSV").text();
  thong_tin.ho_ten_ngay_sinh = $(
    "#ctl00_ContentPlaceHolder1_ctl00_lblContentTenSV"
  ).text();
  thong_tin.lop_nganh_khoa = $(
    "#ctl00_ContentPlaceHolder1_ctl00_lblContentLopSV"
  ).text();

  $(".grid-roll2 > table").each(function () {
    const data_mh: string[] = [];
    $(this)
      .find("tbody > tr > td")
      .each(function () {
        if (!$(this).find(".body-table").html()) {
          data_mh.push($(this).text());
        } else {
          data_mh.push($(this).find("div").text());
        }
      });

    data_tkb.push(data_mh);
  });

  return res.json({ hoc_ki, thong_tin, data_tkb });
});

app.get("/dkcn", async (req, res) => {
  const data: any = {
    students: [],
  };
  const URL = "https://fit.sgu.edu.vn/dkcn/memberlist.php";
  const resultPage = await axios.get(URL);
  const $Page = cheerio.load(resultPage.data);
  const totalPage = $Page(".first_last > a").attr("href").split("page=")[1];
  data.totalPage = +totalPage;
  for (let index = 1; index <= +totalPage; index++) {
    const urlEach = `https://fit.sgu.edu.vn/dkcn/memberlist.php?&order=asc&sort=code&asearch=&page=${index}`;
    const resultEach = await axios.get(urlEach);
    const $ = cheerio.load(resultEach.data);
    $("#memberlist_table > tbody > tr").each(function (index) {
      const infos = [];
      if (index > 0) {
        $(this)
          .find("td")
          .each(function (i) {
            if (i < 4) {
              infos.push($(this).find("span").text());
            }
          });
      }
      const mssv = infos[0];
      const name = `${infos[1]} ${infos[2]}`;
      const dtb = infos[3];
      if (mssv && name && dtb) {
        data.students.push({ mssv, name, dtb });
      }
    });
  }

  data.countStudents = data.students.length;

  // data.students.map(async (item: any) => {
  //   const newStudent = new student({
  //     mssv: item.mssv,
  //     name: item.name,
  //     diemtb: item.dtb,
  //   });
  //   await newStudent.save();
  // });

  return res.json(data);
});

app.use("/students", async (req, res) => {
  const students = await student.find();

  return res.json(students);
});

const PORT = process.env.PORT || 8007;

app.listen(PORT, () => {
  console.log("Server running...." + PORT);
});
