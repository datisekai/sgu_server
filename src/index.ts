import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import cheerio from "cheerio";

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

//get all thong tin

interface thong_tin_sv {
  mssv?: string;
  ho_ten_ngay_sinh?: string;
  ngay_sinh?: string;
  lop_nganh_khoa?: string;
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
    $(this)
      .find("tbody > tr > td")
      .each(function () {});
  });

  return res.json({ hoc_ki, thong_tin });
});

app.listen(8007, () => {
  console.log("Server running....");
});
