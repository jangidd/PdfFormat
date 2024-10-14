import React, { Component } from "react";
import { render } from "react-dom";
import ReactDOM from 'react-dom';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import MyPDFDocument from './MyPDFDocument';
import "./style.css";
import CKEditor from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import XrayChest from "./Utils/XrayChest";
import CampECG from "./Utils/CampECG";
import CampECG2 from "./Utils/CampECG2";
import Optometry from "./Utils/Optometry";
import Optometry2 from "./Utils/Optometry2";
import Optometry3 from "./Utils/Optometry3";
import Optometry4 from "./Utils/Optometry4";
import Audiometry from "./Utils/Audiometry";
import PnsAbnormal from "./Utils/PnsAbnormal";
import XrayLeftShoulder from "./Utils/XrayLeftShoulder";
import XrayRightShoulder from "./Utils/XrayRightShoulder";
import XrayKnee from "./Utils/XrayKnee";
import XraySpineCervical from "./Utils/XraySpineCervical";
import XraySpineLumber from "./Utils/XraySpineLumber";
import XraySpineDorsal from "./Utils/XraySpineDorsal";
import Vitals from "./Utils/Vitals";
import CtHead from "./Utils/CtHead";
import CtAbdomen from "./Utils/CtAbdomen";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Test } from "@jsonforms/core";
import html2pdf from "html2pdf.js";
import axios from "axios";
import Pica from 'pica';
import { PDFDocument } from 'pdf-lib';
import pako from 'pako';
import Compress from 'compress.js';

import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import { error } from "jquery";

//cornerstone init
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init({ showSVGCursors: true });

//web image loader
cornerstoneWebImageLoader.external.cornerstone = cornerstone;

//dcm viewer
// cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
// cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
// cornerstoneWADOImageLoader.webWorkerManager.initialize({
//   maxWebWorkers: navigator.hardwareConcurrency || 1,
//   startWebWorkersOnDemand: true,
//   taskConfiguration: {
//     decodeTask: {
//       initializeCodecsOnStartup: false,
//       usePDFJS: false,
//       strict: false,
//     }
//   }
// })

// const options = [{ label: 'X-RAY CHEST', id: 1 }, { label: "X-RAY KNEE", id: 2 }, { label: "X-RAY SPINE(DORSAL)", id: 3 }, { label: "X-RAY SPINE(CERVICAL)", id: 4 }, { label: "X-RAY SPINE(LUMBER)", id: 5 }, { label: "X-RAY RIGHT-SHOULDER", id: 6 }, { label: "X-RAY LEFT-SHOULDER", id: 7 }, { label: "X-RAY TEMPLATE", id: 8 }, { label: 'CT HEAD', id: 9 }, { label: 'CT PNS', id: 10 }, { label: 'CT ABDOMEN', id: 11 }, { label: 'MRI BRAIN', id: 12 }, { label: 'AUDIOMETRY', id: 13 }, { label: 'ECG', id: 14 }, { label: 'CAMP ECG', id: 15 }]

var current_user = JSON.parse(
  document.getElementById("current-user").textContent
);

///////////// Dynamic lists by aman gupta on 07/07/2023 ///////////////
const options = JSON.parse(current_user.serviceslist).map((service) => ({
  label: service.fields.title,
  id: service.pk,
}));

const exportOptions = JSON.parse(current_user.exportlist).map((item) => ({
  label: item.fields.export,
  id: item.pk,
}));

class App extends Component {
  editor = null;
  constructor() {
    super();
    this.state = {
      modal: false,
      reportFrmData: this.generatePatientTable(),
      options_label: "DEFAULT",
    };
    this.ActionEvents = this.ActionEvents.bind(this);
    this.GetCopiedEvents = this.GetCopiedEvents.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSeletion = this.handleSeletion.bind(this);
    this.generateReport = this.generateReport.bind(this);
    this.GetDivContentOnPDF = this.GetDivContentOnPDF.bind(this);
    this.GetDivContentOnPDFWithoutImage =
      this.GetDivContentOnPDFWithoutImage.bind(this);
    this.GetDivContentAsJSON = this.GetDivContentAsJSON.bind(this);
    this.GetEcgContentOnPDF = this.GetEcgContentOnPDF.bind(this);
    this.uploadEcgPDF = this.uploadEcgPDF.bind(this);
    this.uploadXrayPDF = this.uploadXrayPDF.bind(this);
    this.UploadDivContentOnPDFVitals =
      this.UploadDivContentOnPDFVitals.bind(this);
    this.GetDivContentOnWord = this.GetDivContentOnWord.bind(this);
    this.onclickDiv = this.onclickDiv.bind(this);
    this.enableTool = this.enableTool.bind(this);
  }

  enableTool(tool) {
    const element = document.getElementById("viewport");
    const viewport = cornerstone.getViewport(element);
    switch (tool) {
      case "Zoom":
        cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
        break;
      case "Contrast":
        cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
        break;
      case "Length":
        cornerstoneTools.setToolActive("Length", { mouseButtonMask: 1 });
        break;
      case "Rotate":
        viewport.rotation -= 90;
        cornerstone.setViewport(element, viewport);
        break;
      case "Markers":
        cornerstoneTools.setToolActive("TextMarker", { mouseButtonMask: 1 });
        break;
      case "Magnify":
        cornerstoneTools.setToolActive("Magnify", { mouseButtonMask: 1 });
        break;
      case "Pan":
        cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
        break;
      case "Invert":
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(element, viewport);
        break;
      case "Disable":
        cornerstoneTools.setToolDisabled("Zoom");
        cornerstoneTools.setToolDisabled("Wwwc");
        cornerstoneTools.setToolDisabled("Length");
        cornerstoneTools.setToolDisabled("TextMarker");
        cornerstoneTools.setToolDisabled("Magnify");
        cornerstoneTools.setToolDisabled("Pan");
        break;

      default:
        break;
    }
  }

  onclickDiv(e) {
    var ctrlDown = false,
      ctrlKey = 17,
      cmdKey = 91,
      vKey = 86,
      cKey = 67;

    document
      .onkeydown(function (e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
      })
      .keyup(function (e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
      });

    // Document Ctrl + C/V
    document.keydown(function (e) {
      if (ctrlDown && e.keyCode == cKey) console.log("Document catch Ctrl+C");
      if (ctrlDown && e.keyCode == vKey) console.log("Document catch Ctrl+V");
    });
  }

  ///////////ecg image by aman on 21/08/23
  componentDidMount() {
    console.log("componentDidMount executed.");
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const imageUrl = urlSearchParams.get("data-reportimage");

      //cornerstone
      const element = document.getElementById("viewport");
      //const dcmimageId =
      const new_imageId = "https:" + imageUrl;
      cornerstone.enable(element);
      cornerstone.registerImageLoader(
        "https",
        cornerstoneWebImageLoader.loadImage
      );

      cornerstone.loadImage(new_imageId).then(function (Image) {
        console.log(Image);
        cornerstone.displayImage(element, Image);
      });

      //cornerstoneWADOImageLoader.webWorkerManager.terminate()

      //tools
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
        configuration: {
          invert: false,
          preventZoomOutsideImage: false,
          minScale: 0.1,
          maxScale: 20.0,
        },
      });
      cornerstoneTools.addTool(cornerstoneTools.RotateTool);
      cornerstoneTools.addTool(cornerstoneTools.LengthTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      cornerstoneTools.addTool(cornerstoneTools.MagnifyTool);
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.TextMarkerTool, {
        configuration: {
          markers: ["F5", "F4", "F3", "F2", "F1"],
          current: "F1",
          ascending: true,
          loop: true,
        },
      });

      if (imageUrl) {
        const imageElement = document.createElement("img");
        imageElement.src = imageUrl;
        imageElement.className = "content-image"; // Add the class to the image element

        const editorContent = document.querySelector(
          "#root > div > div > div > div.document-editor__editable-container > div"
        );
        if (editorContent) {
          editorContent.appendChild(imageElement);
          console.log("Image appended successfully.");
        } else {
          console.log("Editor content element not found.");
        }
      } else {
        console.log("Image URL not found in query parameters.");
      }

      this.setState({
        reportFrmData: this.generatePatientTable(),
      });
    } catch (error) {
      console.error("Error in componentDidMount:", error);
    }
  }


  generateReport(data) {
    this.setState({ reportFrmData: data });
  }

  handleClick() {
    const { modal } = this.state;
    this.setState({
      modal: !modal,
    });
  }

  generatePatientTable() {
    let params = new URL(document.location).searchParams;
    const age = params.get("age") ? params.get("age") + "Yr" : "";
    let tableBody = this.companyLogo(current_user);
    tableBody += "<table><tbody>";
    tableBody += "<tr>";
    tableBody += "<td>Patient Name</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Date Of Birth</td><td>" + "NULL" + "</td>";
    tableBody += "</tr>";
    tableBody += "<tr>";
    tableBody += "<td>National Health ID</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Age/Sex</td><td>" + "NULL" + "</td>";
    tableBody += "</tr>";
    tableBody += "<tr>";
    tableBody += "<td>Accession No.</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Referral Dr</td><td>" + " " + "</td>";
    tableBody += "</tr>";
    tableBody += "<tr>";
    tableBody += "<td>Study Date Time</td><td>" + "NULL" + "</td>";
    tableBody += "<td>Report Date Time</td><td>" + "NULL" + "</td>";
    tableBody += "</tr>";
    tableBody += "</tbody>";
    tableBody += "</table>";

    return this.companyLogo(current_user);
  }
  companyLogo(user) {
    return "<img src='" + user.companylogo + "' height='' width='300' />";
  }

  ///////////// Dynamic lists by aman gupta on 07/07/2023 ///////////////
  choose() {
    var list = document.createElement("select");
    list.id = "choose_scan";
    var optionSelect = document.createElement("option");
    optionSelect.value = 0;
    optionSelect.text = "Reporting BOT";
    list.appendChild(optionSelect);
    options.forEach(({ label, id }) => {
      var option = document.createElement("option");
      option.value = id;
      option.text = label;
      list.appendChild(option);
    });
    list.onchange = this.handleSeletion;
    return list;
  }

  actionDropDown() {
    var list = document.createElement("select");
    list.id = "export_data";

    // Logging exportOptions to check if it's populated correctly
    console.log("Export Options:", exportOptions);
    var optionSelect = document.createElement("option");
    optionSelect.value = 0;
    optionSelect.text = "Export Report";
    list.appendChild(optionSelect);

    // Iterate over exportOptions array to create options dynamically
    exportOptions.forEach(({ label, id }) => {
      var option = document.createElement("option");
      option.value = id;
      option.text = label;
      list.appendChild(option);
    });

    list.onchange = this.ActionEvents.bind(this); // bind 'this' to ActionEvents
    return list;
  }

  //Updated copy paste code by Aman Gupta
  copyAction() {
    var btn = document.createElement("a");
    btn.value = "Copy";
    btn.innerHTML = "Copy";
    btn.className = "report-here";
    btn.id = "copy_data";
    btn.addEventListener("click", this.GetCopiedEvents.bind(this));
    console.log("btn copy");
    return btn;
  }

  GetCopiedEvents(event) {
    var content = document.querySelector(
      "#root > div > div > div.document-editor__editable-container > div"
    );
    content = this.extractContent(content);
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([content.outerHTML], { type: "text/html" }),
    });
    navigator.clipboard
      .write([clipboardItem])
      .then(() => {
        console.log("Content copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy content to clipboard:", err);
      });
  }

  extractContent(s) {
    var span = document.createElement("span");
    span.innerHTML = s.innerHTML;
    var filterHtml = [...span.getElementsByTagName("table")];
    filterHtml.forEach((child) => {
      child.remove();
    });
    var img = [...span.getElementsByTagName("img")];
    img.forEach((child) => {
      child.remove();
    });

    return span;
  }

  userDropdown() {
    var userDiv = document.createElement("div");
    var current_user = JSON.parse(
      document.getElementById("current-user").textContent
    );
    userDiv.innerHTML = `Welcome <span class='current-user'>${current_user.username}</span>`;
    userDiv.className = "user-name";
    current_user.className = "xyz";

    var logout = document.createElement("a");
    logout.href = "/logout";
    logout.innerHTML = "Logout";

    userDiv.appendChild(logout);
    logout.className = "report-here";

    return userDiv;
  }

  //print function add by Aman Gupta on 28/06/23
  printReport() {
    const data = document.querySelector(".ck-editor__editable");

    if (data !== null) {
      data.classList.add("ck-blurred");
      data.classList.remove("ck-focused");

      // Apply inline CSS styles
      data.style.fontSize = "28px";
      data.style.padding = "6px";

      // Add CSS styles for the table
      const tableStyle = `
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* Added to ensure equal cell sizes */
          }
  
          td {
            border: 1px solid black;
            padding: 2px;
            font-size: 20px;
            width: auto; /* Adjust this value as needed */
          }
        </style>
      `;
      data.innerHTML = tableStyle + data.innerHTML;

      window.print();
    }
  }

  //Aman(searchfield for IDs)

  // createFilename() {
  //   //Aman
  //   const urlSearchParams = new URLSearchParams(window.location.search);
  //   var patientName = document.querySelector(
  //     "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
  //   )?.innerHTML;
  //   var PatientId = document.querySelector(
  //     "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
  //   )?.innerHTML;
  //   var location = urlSearchParams.get("data-location");
  //   //   filename = ["Patient", "0", "Test", "Date"];
  //   // }
  //   var filename = [patientName, PatientId];
  //   if (
  //     patientName == undefined ||
  //     patientName == null ||
  //     PatientId == undefined
  //   ) {
  //     filename = ["Patient", "0"];
  //   } else {
  //     filename = [
  //       PatientId.replace("Patient ID:", "").replace(" ", "_"),
  //       patientName.replace("Name:", " "),
  //       location,
  //     ];
  //   }

  //   //return filename.join('_').toUpperCase();
  //   filename = filename.filter(Boolean).join("_").toUpperCase();
  //   filename = filename.replace(/^_/, ""); // Remove leading underscore if present
  //   return filename;
  // }


   ////////////////////////////////// EVERYTHING RELATED TO REPORT FORMAT //////////////////////////// 
  // This will contain all the new functionalities which i have changed in the code which runs in backend which 
  // supports the PDF generation in all the required formats. - Himanshu. ( 01-10-2024 ).

  // These are all the functions that are common.

  // This will show the loader at the starting of the Report Generation Logic.

  showLoader = () => {
    console.log("Showing loader");
    const loader = document.querySelector(".loader");
    if (loader) {
        loader.style.display = "block";
    }
  };

  // This will hide the loader after report generation and doing respective task.
  hideLoader = () => {
    console.log("Hiding loader");
    const loader = document.querySelector(".loader");
    if (loader) {
        loader.style.display = "none";
    }
  };

  // This is the function/method with standard syntax which creates the filename as id_name
  createFilename() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientNameElement = document.querySelector(
      "#root > div > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
    );
    const PatientIdElement = document.querySelector(
      "#root > div > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
    );
    const patientName = patientNameElement?.innerHTML.trim(); // Trim extra spaces
    const PatientId = PatientIdElement?.innerHTML.trim(); // Trim extra spaces
    const location = urlSearchParams.get("data-location");

    let filename;
    if (!patientName || !PatientId) {
      filename = ["Patient", "0"];
    } else {
      filename = [
        PatientId.replace("Patient ID:", "").replace(" ", "_"),
        patientName.replace("Name:", "").trim(), // Trim extra spaces
        location,
      ];
    }

    // Rest of your code
    filename = filename.filter(Boolean).join("_").toUpperCase();
    filename = filename.replace(/^_/, ""); // Remove leading underscore if present
    return filename;
  }


  // This is the function to get the Uri of the data.
  getDataUri(url) {
    return new Promise((resolve) => {
      var image = new Image();
      image.setAttribute("crossOrigin", "anonymous"); //getting images from external domain

      image.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;

        //next three lines for white background in case png has a transparent background
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; /// set white fill style
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.getContext("2d").drawImage(this, 0, 0);

        resolve(canvas.toDataURL("image/jpeg"));
      };

      image.src = url;
    });
  }


  // This is the function to extract the data that is passed in the url. 
  extractDataFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get("data-patientid");
    const patientName = urlParams.get("data-patientname");
    const age = urlParams.get("data-age");
    const gender = urlParams.get("data-gender");
    const testDate = urlParams.get("data-testdate");
    const reportDate = urlParams.get("data-reportdate");
    const location = urlParams.get("data-location");
    const accession = urlParams.get("data-accession");
    const reportImageUrl = urlParams.get("data-reportimage");

    return { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl };
  };

  // Showing the notification on the browser.
  showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
          notificationText.innerText = message;
          notification.style.display = "block";

          setTimeout(() => {
              notification.style.display = "none";
          }, 1500);
      }
  };

  // getting the csrf token for much better and secured processing.
  getCSRFToken = async () => {
      try {
          const response = await fetch("/get-csrf-token/");
          const data = await response.json();
          return data.csrf_token;
      } catch (error) {
          console.error("Error fetching CSRF token:", error);
          throw error;
      }
  };

  // Fetching the image and converting it to a Base 64 data so that it can be added to the pdf correctly.
  fetchImageAsBase64 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });
      } catch (error) {
          console.error("Error fetching image:", error);
          throw error;
      }
  };

  // Adding the logo on the pdf.
  addLogo = async (pdf, logoUrl, currentYPosition) => {
      if (logoUrl) {
          try {
              const imageData = await this.fetchImageAsBase64(logoUrl);
              const pageWidth = pdf.internal.pageSize.width;
              const imgWidth = pageWidth - 80;
              const imgHeight = 50;
              const imgX = 40;
              const imgY = currentYPosition;

              pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
              currentYPosition = imgY + imgHeight + 20;
              return currentYPosition;
          } catch (error) {
              console.log("Error adding logo image to PDF:", error);
              throw error;
          }
      }
      return currentYPosition;
  };

  // Adding the doctor signature on the pdf.
  addSignature = async (pdf, signatureUrl, currentYPosition) => {
      if (signatureUrl) {
          try {
              const imageData = await this.fetchImageAsBase64(signatureUrl);
              const pageWidth = pdf.internal.pageSize.width;
              const imgWidth = pageWidth - 80;
              const imgHeight = 40;
              const imgX = 40;
              const imgY = currentYPosition ;

              pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
              currentYPosition = imgY + imgHeight + 20;
              return currentYPosition;
          } catch (error) {
              console.log("Error adding signature image to PDF:", error);
              throw error;
          }
      }
      return currentYPosition;
  };

  // Adding the doctor signature on the pdf of Ecg.
  addECGSignature = async (pdf, signatureUrl, currentYPosition) => {
    if (signatureUrl) {
        try {
            const imageData = await this.fetchImageAsBase64(signatureUrl);
            const pageWidth = pdf.internal.pageSize.width;
            const imgWidth = pageWidth - 80;
            const imgHeight = 100;
            const imgX = 40;
            const imgY = currentYPosition ;

            pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
            currentYPosition = imgY + imgHeight + 20;
            return currentYPosition;
        } catch (error) {
            console.log("Error adding signature image to PDF:", error);
            throw error;
        }
    }
    return currentYPosition;
  };

  // This is for adding the image on the single page of an pdf.
  addReportImage = async (pdf, reportImageUrl, currentYPosition) => {
    const A4_HEIGHT = 841.89; // A4 height in points (for "pt" unit used in jsPDF)

    if (reportImageUrl) {
        try {
            const imageData = await this.fetchImageAsBase64(reportImageUrl);
            const pageWidth = pdf.internal.pageSize.width;
            const imgWidth = 300;
            const imgHeight = 200;
            const imgX = (pageWidth - imgWidth) / 2;
            const imgY = currentYPosition;

            // Calculate the new Y position after adding the image
            const newYPosition = imgY + imgHeight + 20;

            // Check if the new Y position exceeds the A4 page height
            if (newYPosition > A4_HEIGHT) {
                // Add a new page to the PDF
                pdf.addPage();
                // Reset currentYPosition for the new page
                currentYPosition = 40; // Start at a margin from the top of the new page
            }

            // Add the image
            pdf.addImage(imageData, "PNG", imgX, currentYPosition, imgWidth, imgHeight);

            // Update currentYPosition for the next content
            currentYPosition = imgY + imgHeight + 20; // Update the position for the next content
            return currentYPosition;
        } catch (error) {
            console.error("Error adding image to PDF:", error);
            this.hideLoader();
            this.showNotification("Error processing image. Please try again.");
            throw error;
        }
    }
    return currentYPosition;
  };


  // Add this part in the try part of the addSeparateImage and this will be all for adding the image on the page.
  // in center in portrait mode i.e. leaving some space from top and bottom and then giving the image on the pdf.

  // const imageData = await this.fetchImageAsBase64(reportImageUrl);
  // const pageWidth = pdf.internal.pageSize.width;
  // const pageHeight = pdf.internal.pageSize.height;

  // // Set margins
  // const margin = 20; // Margin from each side
  // const imgWidth = pageWidth - 2 * margin; // Width minus margins
  // const imgHeight = 400;

  // const imgX = margin; // Start X position with margin
  // const imgY = (pageHeight - imgHeight) / 2; // Center vertically

  // pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
  // currentYPosition = imgY + imgHeight + 20; // Update position if needed
  // return currentYPosition;

  addSeparateImageOnEcg = async (pdf, reportImageUrl, currentYPosition) => {
    if (reportImageUrl) {
        try {
            // Fetch the image from the URL
            const response = await fetch(reportImageUrl);
            const blob = await response.blob();
            const img = new Image();
            img.src = URL.createObjectURL(blob);

            // Wait for the image to load
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            // Create a canvas for the original image
            const originalCanvas = document.createElement('canvas');
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            const originalCtx = originalCanvas.getContext('2d');
            originalCtx.drawImage(img, 0, 0);

            // Create a canvas for the resized image
            const resizedCanvas = document.createElement('canvas');
            const pica = new Pica();
            const targetWidth = Math.min(800, img.width);
            const targetHeight = Math.min(600, img.height);
            resizedCanvas.width = targetWidth;
            resizedCanvas.height = targetHeight;

            // Resize the image using Pica
            await pica.resize(originalCanvas, resizedCanvas);

            // Convert resized image to Blob with lower quality
            const resizedImageData = await new Promise((resolve) => {
                resizedCanvas.toBlob((blob) => {
                    const newImg = new Image();
                    newImg.src = URL.createObjectURL(blob);
                    newImg.onload = () => {
                        resolve(newImg.src);
                    };
                }, 'image/jpeg', 0.5); // Change to 'image/jpeg' and reduce quality
            });

            // Create a canvas to rotate the image
            const rotationCanvas = document.createElement('canvas');
            const rotationCtx = rotationCanvas.getContext('2d');
            rotationCanvas.width = resizedCanvas.height;
            rotationCanvas.height = resizedCanvas.width;

            rotationCtx.translate(rotationCanvas.width / 2, rotationCanvas.height / 2);
            rotationCtx.rotate(Math.PI / 2);
            rotationCtx.drawImage(resizedCanvas, -resizedCanvas.width / 2, -resizedCanvas.height / 2);

            const canvasImageData = rotationCanvas.toDataURL('image/jpeg', 0.7); // Use JPEG for better compression

            // Calculate margins and dimensions for the PDF
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height;
            const margin = 20;

            const aspectRatio = rotationCanvas.width / rotationCanvas.height;
            let pdfImgWidth = pageWidth - 2 * margin;
            let pdfImgHeight = pdfImgWidth / aspectRatio;

            if (pdfImgHeight > pageHeight - 2 * margin) {
                pdfImgHeight = pageHeight - 2 * margin;
                pdfImgWidth = pdfImgHeight * aspectRatio;
            }

            const imgX = (pageWidth - pdfImgWidth) / 2;
            const imgY = (pageHeight - pdfImgHeight) / 2;

            pdf.addImage(canvasImageData, 'JPEG', imgX, imgY, pdfImgWidth, pdfImgHeight);

            return currentYPosition;
        } catch (error) {
            console.error('Error adding image to PDF:', error);
            this.hideLoader();
            this.showNotification('Error processing image. Please try again.');
            throw error;
        }
    }
    return currentYPosition;
  };


  // Add separate image on the first page of ECG Report .
  // addSeparateImageOnEcg = async (pdf, reportImageUrl, currentYPosition) => {
  //   if (reportImageUrl) {
  //       try {
  //           // Fetch the image from the URL
  //           const response = await fetch(reportImageUrl);
  //           const blob = await response.blob(); // Convert response to Blob
  //           const img = new Image();
  //           img.src = URL.createObjectURL(blob);

  //           // Wait for the image to load
  //           await new Promise((resolve) => {
  //               img.onload = resolve;
  //           });

  //           // Create a canvas to resize the image
  //           const originalCanvas = document.createElement('canvas');
  //           const originalCtx = originalCanvas.getContext('2d');
  //           originalCanvas.width = img.width;
  //           originalCanvas.height = img.height;
  //           originalCtx.drawImage(img, 0, 0);

  //           // Create a canvas for the resized image
  //           const resizedCanvas = document.createElement('canvas');
  //           const pica = new Pica();
  //           const targetWidth = Math.min(800, img.width); // Set target width
  //           const targetHeight = Math.min(600, img.height); // Set target height
  //           resizedCanvas.width = targetWidth;
  //           resizedCanvas.height = targetHeight;

  //           // Resize the image
  //           await pica.resize(originalCanvas, resizedCanvas);

  //           // Get the resized image data
  //           const resizedImageData = await new Promise((resolve) => {
  //               resizedCanvas.toBlob((blob) => {
  //                   const newImg = new Image();
  //                   newImg.src = URL.createObjectURL(blob);
  //                   newImg.onload = () => {
  //                       resolve(newImg.src);
  //                   };
  //               }, 'image/png', 0.7); // Adjust the quality as needed
  //           });

  //           // Create a canvas to rotate the image
  //           const rotationCanvas = document.createElement('canvas');
  //           const rotationCtx = rotationCanvas.getContext('2d');
  //           rotationCanvas.width = resizedCanvas.height; // Swap dimensions for rotation
  //           rotationCanvas.height = resizedCanvas.width; // Swap dimensions for rotation

  //           // Translate to the center of the canvas, rotate, and draw
  //           rotationCtx.translate(rotationCanvas.width / 2, rotationCanvas.height / 2);
  //           rotationCtx.rotate(Math.PI / 2); // Rotate 90 degrees
  //           rotationCtx.drawImage(resizedCanvas, -resizedCanvas.width / 2, -resizedCanvas.height / 2);

  //           // Get the rotated image data
  //           const canvasImageData = rotationCanvas.toDataURL('image/png', 0.7); // Adjust the quality as needed

  //           // Calculate margins and dimensions for the PDF
  //           const pageWidth = pdf.internal.pageSize.width;
  //           const pageHeight = pdf.internal.pageSize.height;
  //           const margin = 20;

  //           // Maintain the aspect ratio of the image
  //           const aspectRatio = rotationCanvas.width / rotationCanvas.height;
  //           let pdfImgWidth = pageWidth - 2 * margin;
  //           let pdfImgHeight = pdfImgWidth / aspectRatio;

  //           // If the height exceeds pageHeight minus margins, adjust
  //           if (pdfImgHeight > pageHeight - 2 * margin) {
  //               pdfImgHeight = pageHeight - 2 * margin;
  //               pdfImgWidth = pdfImgHeight * aspectRatio;
  //           }

  //           // Center the image within the margins
  //           const imgX = (pageWidth - pdfImgWidth) / 2;
  //           const imgY = (pageHeight - pdfImgHeight) / 2;

  //           // Add the image to the PDF
  //           pdf.addImage(canvasImageData, 'PNG', imgX, imgY, pdfImgWidth, pdfImgHeight);

  //           return currentYPosition;
  //       } catch (error) {
  //           console.error('Error adding image to PDF:', error);
  //           this.hideLoader();
  //           this.showNotification('Error processing image. Please try again.');
  //           throw error;
  //       }
  //   }
  //   return currentYPosition;
  // };

    // Add separate image on the first page of both ECG and Xray.
    addSeparateImageOnXray = async (pdf, reportImageUrl, currentYPosition) => {
      if (reportImageUrl) {
          try {
              const imageData = await this.fetchImageAsBase64(reportImageUrl);
              const pageWidth = pdf.internal.pageSize.width;
              const pageHeight = pdf.internal.pageSize.height;

              // Set margins
              const margin = 20; // Margin from each side
              const imgWidth = pageWidth - 2 * margin; // Width minus margins
              const imgHeight = 400;

              const imgX = margin; // Start X position with margin
              const imgY = (pageHeight - imgHeight) / 2; // Center vertically

              pdf.addImage(imageData, "PNG", imgX, imgY, imgWidth, imgHeight);
              currentYPosition = imgY + imgHeight + 20; // Update position if needed
              return currentYPosition;
          } catch (error) {
              console.error('Error adding image to PDF:', error);
              this.hideLoader();
              this.showNotification('Error processing image. Please try again.');
              throw error;
          }
      }
      return currentYPosition;
    };


  // End of all the common functions for the reporting bot.

  ///////////////////////////////// PDF GENERATION CODE /////////////////////////////////////////
  GetDivContentAsJSON() {
    const showLoader = () => {
      console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    // Show the loader before starting the JSON generation
    showLoader();

    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Remove the last image element from the capture
    const images = data.querySelectorAll("img");
    if (images.length > 0) {
      const lastImage = images[images.length - 1];
      lastImage.style.display = "none"; // Hide the last image
    }

    if (data != undefined) {
      // Create an object to hold the JSON report
      const jsonReport = {
        content: [],
        table: "",
        paragraphs: [],
      };

      // Extract table text content
      if (table) {
        jsonReport.table = table.textContent.trim();
      }

      // Extract paragraph text content
      const paragraphs = data.querySelectorAll("p");
      paragraphs.forEach((paragraph) => {
        const paragraphText = paragraph.textContent.trim();
        jsonReport.paragraphs.push(paragraphText);
      });

      // Collect all text content into the main content array
      jsonReport.content = data.textContent.trim();

      // Show the last image again
      if (images.length > 0) {
        const lastImage = images[images.length - 1];
        lastImage.style.display = "block";
      }

      // Hide the loader when the JSON report is ready
      hideLoader();

      // Save the JSON report as a file
      const filename = this.createFilename() || "report";
      const jsonString = JSON.stringify(jsonReport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Redirect to the previous page after a short delay
      delay(200).then(() => {
        window.location.reload(true);
      });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////// Download PDF without Image /////////////////////////////
  GetDivContentOnPDFWithoutImage() {
    // const showLoader = () => {
    //   console.log("Showing loader");
    //   const loader = document.querySelector(".loader");
    //   if (loader) {
    //     loader.style.display = "block";
    //   }
    // };

    // const hideLoader = () => {
    //   console.log("Hiding loader");
    //   const loader = document.querySelector(".loader");
    //   if (loader) {
    //     loader.style.display = "none";
    //   }
    // };
    // // Show the loader before starting the PDF generation
    // showLoader();
    // var filename = this.createFilename();
    // const data = document.getElementsByClassName("ck-editor__editable")[0];
    // const table = data.querySelector("table");
    // data.classList.add("ck-blurred");
    // data.classList.remove("ck-focused");
    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // // Remove the last image element from the capture
    // const images = data.querySelectorAll("img");
    // if (images.length > 0) {
    //   const lastImage = images[images.length - 1];
    //   lastImage.style.display = "none"; // Hide the last image
    // }

    // if (data != undefined) {
    //   var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
    //   var a4Height = 841.89; // A4 height in points

    //   var canvasWidth = a4Width - 40; // Adjusted width to leave some margin

    //   html2canvas(data, {
    //     scale: 4, // Adjust the scale if needed for better quality
    //     windowWidth: document.body.scrollWidth,
    //     windowHeight: document.body.scrollHeight,
    //   }).then(async (canvas) => {
    //     const imgData = canvas.toDataURL("image/png", 1.0);

    //     // Calculate the height based on the aspect ratio of the captured image
    //     const canvasHeight = (canvasWidth / canvas.width) * canvas.height;

    //     // Show the last image again
    //     if (images.length > 0) {
    //       const lastImage = images[images.length - 1];
    //       lastImage.style.display = "block";
    //     }

    //     // Hide the loader when the PDF is ready
    //     hideLoader();

    //     // Create PDF with only the captured content
    //     const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);
    //     pdf.addImage(imgData, "PNG", 20, 20, canvasWidth, canvasHeight);

    //     pdf.setTextColor(255, 255, 255);

    //     // Calculate the position to place the text at the bottom
    //     const textX = 40;
    //     const textY = 841.89 - 2; // 20 points from the bottom

    //     // If a table exists within the ck-editor__editable div, capture its text content
    //     if (table) {
    //       const tableText = table.textContent || "";

    //       // Add the table text as text (preserve original formatting)
    //       pdf.setFontSize(2); // Adjust the font size as needed
    //       pdf.text(textX, textY, tableText);
    //     }

    //     // Iterate through all paragraphs in the ck-editor__editable div
    //     const paragraphs = data.querySelectorAll("p");
    //     paragraphs.forEach((paragraph) => {
    //       const paragraphText = paragraph.textContent || "";

    //       // Add each paragraph text as text (preserve original formatting)
    //       pdf.setFontSize(2); // Adjust the font size as needed
    //       pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
    //     });

    //     // Save the PDF
    //     pdf.save(filename ? filename + ".pdf" : "download.pdf");

    //     // Redirect to the previous page after a short delay
    //     await delay(200);
    //     window.location.reload(true);
    //   });
    // }

    (async () => {
      this.showLoader();
      const filename = this.createFilename();
      const data = document.getElementsByClassName("ck-editor__editable")[0];
      
      const images = data.querySelectorAll("img");
      const signatureElement = images[1];
      const signatureUrl = signatureElement ? signatureElement.src : null;
      const logoElement = images[0];
      const logoUrl = logoElement ? logoElement.src : null;
      console.log("This is the signature Url:", signatureUrl);
      console.log("This is the logo Url:", logoUrl);

      const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = this.extractDataFromURL();

      const pdf = new jsPDF("p", "pt", "a4");

      let currentYPosition = 40;

      try {
          currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

          const tableData = [
              ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
              ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
              ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
          ];

          currentYPosition += 20;

          pdf.autoTable({
              startY: currentYPosition,
              body: tableData,
              theme: 'grid',
              styles: {
                  cellPadding: 3,
                  fontSize: 10,
              },
          });
          currentYPosition = pdf.previousAutoTable.finalY + 20;

          const paragraphs = data.querySelectorAll("p");
          const columnWidth = (pdf.internal.pageSize.width - 80) / 2; // 80 = 40px margin on each side
          let isLeftColumn = true; // Start with left column
          let leftColumnY = 0;
          let rightColumnY = 0;
          const marginX = 40; // Margin from left side
          const columnGap = 10; // Gap between columns
          const bullet = "\u2022 ";
          // For fixing the ckeditor problem i am using this logic - Himanshu.
          const observationArray = [];
          console.log("This is the complete fetched paragraph tag from ckeditor:");
          console.log(paragraphs)
          console.log("End of the paragraphs tag.")
          

          for (const paragraph of paragraphs) {
              const paragraphText = paragraph.textContent || "";
              console.log("These is the paragraph text :", paragraphText);

              pdf.setFontSize(12);
              pdf.setFont("helvetica", "bold");

              if (paragraphText.includes("OBSERVATIONS:")) {
                  pdf.text(paragraphText, marginX, currentYPosition);
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "normal");
                  currentYPosition += 20;
              } else if (paragraphText.includes("IMPRESSION:")) {
                  // Adding the logic to add the observation lines just before the Impression line.
                  // setting the font size and the font family back to normal.
                  pdf.setFontSize(12); 
                  pdf.setFont("helvetica", "normal");
                  const totallines = observationArray.length;
                  const halflines = Math.ceil(totallines / 2);
                  console.log("This is the observation array :", observationArray);

                  // Adding the bullet point to the lines before printing them  on the pdf.
                  const addBulletPoint = (line) => {
                    if (line.startsWith(bullet)) {
                        return line;
                    }
                    return bullet + line;
                  };

                  // setting the left column and right column logic (left one is not needed, i can optimise it later.)
                  rightColumnY = currentYPosition;
                  leftColumnY = currentYPosition;

                  // Processing the texts which will fix the line text width greater than the column width issue.
                  const processTextColumn = (text, x, y, columnWidth) => {
                    let currentY = y;
                    const textWidth = pdf.getTextWidth(text);
                    const maxWidth = columnWidth - 20; // Padding for each column
                    console.log("This is the current y (at the beginning of processing the new line of array ) :", currentY);
                    console.log("This is the textWidth :", textWidth);
                    console.log("This is the maxwidth :", maxWidth);
            
                    if (textWidth > maxWidth) {
                      let remainingText = text;
                      pdf.setFont("helvetica", "normal");
                      let currentLine = '';
                  
                      // Split text into words
                      const words = remainingText.split(' ');
                  
                      for (const word of words) {
                          // Construct a test line with the next word
                          const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
                          console.log("This is the testline :", testLine);
                          const testLineWidth = pdf.getTextWidth(testLine);
                  
                          if (testLineWidth > maxWidth) {
                              // If it exceeds the width, print the current line
                              if (currentLine.length > 0) {
                                  console.log("if the current line is greater than the maxwidth and is having some data:");
                                  console.log("This is the current line", currentLine);
                                  pdf.text(currentLine, x, currentY);
                                  currentY += 15; // Move down for the next line
                                  console.log("This is the current y :", currentY);
                              }
                              // Start a new line with the current word
                              currentLine = "  " + word; // Reset current line to the word that caused overflow
                              console.log("This is the remaining word or sentence added with a space here :", currentLine);
                              
                          } else {
                              // If it fits, update the current line
                              currentLine = testLine;
                          }
                      }
                  
                      // Print any remaining text in currentLine
                      if (currentLine.length > 0) {
                          pdf.text(currentLine, x, currentY);
                          console.log("Printing any current line if left :", currentLine);
                          console.log("This is the current y updated on the remaining text code :", currentY);
                      }
                    } else {
                        pdf.text(text, x, currentY);
                        console.log("Adding the text directly because it doesn't need separation :", text);
                        console.log("the current y for directly added text:", currentY);
                    }

                    console.log("This is the current Y before just coming out of the process (return currenty +15) :", currentY);
                    
                    return currentY + 15;
                  
                  };

                  // Adding the lines to the respective side along with the bullet points. 
                  for (let i = 0; i < totallines; i++) {
                    const lineWithBullet = addBulletPoint(observationArray[i]);
                    console.log("These are the observation array lines given one by one :");
                    console.log(lineWithBullet);
                    console.log("End of the observation array separated lines.");
                    if (i < halflines) {
                        leftColumnY = processTextColumn(lineWithBullet, marginX, leftColumnY, columnWidth);
                    } else {
                        rightColumnY = processTextColumn(lineWithBullet, marginX + columnWidth + columnGap, rightColumnY, columnWidth);
                    }
                  }
                  currentYPosition = Math.max(leftColumnY, rightColumnY);
                  console.log("This is the right Column y :", rightColumnY);
                  console.log("This is the left column y :", leftColumnY);
                  console.log("This is the current y position :", currentYPosition);
                  // End of the observation text's logic.
                  currentYPosition += 20;
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(paragraphText, marginX, currentYPosition);
                  pdf.setFontSize(10);
                  pdf.setFont("helvetica", "normal");
                  currentYPosition += 20;
              } else if (paragraphText.includes("Dr.")) {
                  currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                  pdf.setFontSize(12);
                  pdf.setFont("helvetica", "normal");
                  const drdatalines = paragraphText.split(',').map(line => line.trim()).filter(line => line.length > 0);
                  for (const drdata of drdatalines){
                    pdf.text(drdata, marginX, currentYPosition);
                    currentYPosition += 15;
                  }
                  currentYPosition += 10;
              } else if (paragraphText.includes("X-RAY")) {
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(paragraphText, marginX, currentYPosition);
                  currentYPosition += 20;
              } else if (paragraphText.includes(bullet)) {
                  pdf.setFontSize(12);
                  pdf.setFont("helvetica", "bold");
                  const impressionlines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                  for (const line of impressionlines) {
                    pdf.text(line, marginX, currentYPosition);
                  }
                  currentYPosition += 20;
              } else {
                // Handle text in columnar structure
                const lines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                console.log("These are the lines of the observation :")
                console.log(lines)
                console.log("End of lines of the observation.")
                // Adding the observation text in the array. 
                for (const observationtext of lines){
                  observationArray.push(observationtext);
                }
                // End of the observation text logic.
                
            }
          }              

          // This is to download the file on the same browser.
          pdf.save(filename ? filename + ".pdf" : "download.pdf");

          const currentURL = window.location.href;

          setTimeout(() => {
              window.location.href = document.referrer + "?nocache=" + Date.now();
          }, 200);

          window.addEventListener("popstate", () => {
              if (window.location.href !== currentURL) {
                  setTimeout(() => {
                      window.location.reload(true);
                  }, 200);
              }
          });

      } catch (error) {
          console.error("Error generating PDF:", error);
          this.showNotification("Error generating PDF. Please try again.");
      } finally {
          this.hideLoader();
      }
  })();
  }

  ////////////////////////////////// Another one upgraded on 05/01/2024 ////////////////////////
  GetDivContentOnPDF() {

    (async () => {
      this.showLoader();
      const filename = this.createFilename();
      const data = document.getElementsByClassName("ck-editor__editable")[0];
      
      const images = data.querySelectorAll("img");
      const signatureElement = images[1];
      const signatureUrl = signatureElement ? signatureElement.src : null;
      const logoElement = images[0];
      const logoUrl = logoElement ? logoElement.src : null;
      console.log("This is the signature Url:", signatureUrl);
      console.log("This is the logo Url:", logoUrl);

      const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = extractDataFromURL();

      const pdf = new jsPDF("p", "pt", "a4");

      let currentYPosition = 40;

      try {
          currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

          const tableData = [
              ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
              ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
              ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
          ];

          currentYPosition += 20;

          pdf.autoTable({
              startY: currentYPosition,
              body: tableData,
              theme: 'grid',
              styles: {
                  cellPadding: 3,
                  fontSize: 10,
              },
          });
          currentYPosition = pdf.previousAutoTable.finalY + 20;

          const paragraphs = data.querySelectorAll("p");
          const columnWidth = (pdf.internal.pageSize.width - 80) / 2; // 80 = 40px margin on each side
          let isLeftColumn = true; // Start with left column
          let leftColumnY = 0;
          let rightColumnY = 0;
          const marginX = 40; // Margin from left side
          const columnGap = 10; // Gap between columns
          const bullet = "\u2022 ";
          // For fixing the ckeditor problem i am using this logic - Himanshu.
          const observationArray = [];
          console.log("This is the complete fetched paragraph tag from ckeditor:");
          console.log(paragraphs)
          console.log("End of the paragraphs tag.")
          

          for (const paragraph of paragraphs) {
              const paragraphText = paragraph.textContent || "";
              console.log("These is the paragraph text :", paragraphText);

              pdf.setFontSize(12);
              pdf.setFont("helvetica", "bold");

              if (paragraphText.includes("OBSERVATIONS:")) {
                  pdf.text(paragraphText, marginX, currentYPosition);
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "normal");
                  currentYPosition += 20;
              } else if (paragraphText.includes("IMPRESSION:")) {
                  // Adding the logic if the lines are lesser than 6 than they will get printed in the normal manner.
                  if (observationArray.length > 5){
                    // Adding the logic to add the observation lines just before the Impression line.
                    // setting the font size and the font family back to normal.
                    pdf.setFontSize(12); 
                    pdf.setFont("helvetica", "normal");
                    const totallines = observationArray.length;
                    const halflines = Math.ceil(totallines / 2);
                    console.log("This is the observation array :", observationArray);

                    // Adding the bullet point to the lines before printing them  on the pdf.
                    const addBulletPoint = (line) => {
                      if (line.startsWith(bullet)) {
                          return line;
                      }
                      return bullet + line;
                    };

                    // setting the left column and right column logic (left one is not needed, i can optimise it later.)
                    rightColumnY = currentYPosition;
                    leftColumnY = currentYPosition;

                    // Processing the texts which will fix the line text width greater than the column width issue.
                    const processTextColumn = (text, x, y, columnWidth) => {
                      let currentY = y;
                      const textWidth = pdf.getTextWidth(text);
                      const maxWidth = columnWidth - 20; // Padding for each column
                      console.log("This is the current y (at the beginning of processing the new line of array ) :", currentY);
                      console.log("This is the textWidth :", textWidth);
                      console.log("This is the maxwidth :", maxWidth);
              
                      if (textWidth > maxWidth) {
                        let remainingText = text;
                        pdf.setFont("helvetica", "normal");
                        let currentLine = '';
                    
                        // Split text into words
                        const words = remainingText.split(' ');
                    
                        for (const word of words) {
                            // Construct a test line with the next word
                            const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
                            console.log("This is the testline :", testLine);
                            const testLineWidth = pdf.getTextWidth(testLine);
                    
                            if (testLineWidth > maxWidth) {
                                // If it exceeds the width, print the current line
                                if (currentLine.length > 0) {
                                    console.log("if the current line is greater than the maxwidth and is having some data:");
                                    console.log("This is the current line", currentLine);
                                    pdf.text(currentLine, x, currentY);
                                    currentY += 15; // Move down for the next line
                                    console.log("This is the current y :", currentY);
                                }
                                // Start a new line with the current word
                                currentLine = "  " + word; // Reset current line to the word that caused overflow
                                console.log("This is the remaining word or sentence added with a space here :", currentLine);
                                
                            } else {
                                // If it fits, update the current line
                                currentLine = testLine;
                            }
                        }
                    
                        // Print any remaining text in currentLine
                        if (currentLine.length > 0) {
                            pdf.text(currentLine, x, currentY);
                            console.log("Printing any current line if left :", currentLine);
                            console.log("This is the current y updated on the remaining text code :", currentY);
                        }
                      } else {
                          pdf.text(text, x, currentY);
                          console.log("Adding the text directly because it doesn't need separation :", text);
                          console.log("the current y for directly added text:", currentY);
                      }

                      console.log("This is the current Y before just coming out of the process (return currenty +15) :", currentY);
                      
                      return currentY + 15;
                    
                    };

                    // Adding the lines to the respective side along with the bullet points. 
                    for (let i = 0; i < totallines; i++) {
                      const lineWithBullet = addBulletPoint(observationArray[i]);
                      console.log("These are the observation array lines given one by one :");
                      console.log(lineWithBullet);
                      console.log("End of the observation array separated lines.");
                      if (i < halflines) {
                          leftColumnY = processTextColumn(lineWithBullet, marginX, leftColumnY, columnWidth);
                      } else {
                          rightColumnY = processTextColumn(lineWithBullet, marginX + columnWidth + columnGap, rightColumnY, columnWidth);
                      }
                    }
                    currentYPosition = Math.max(leftColumnY, rightColumnY);
                    console.log("This is the right Column y :", rightColumnY);
                    console.log("This is the left column y :", leftColumnY);
                    console.log("This is the current y position :", currentYPosition);
                  } else {

                    // Adding the bullet point.
                    const addBulletPoint = (line) => {
                      if (line.startsWith(bullet)) {
                          return line;
                      }
                      return bullet + line;
                    };

                    // Now adding the texts in normal manner.
                    for (const line of observationArray){
                      const lineWithBullet = addBulletPoint(line);
                      pdf.text(lineWithBullet, marginX, currentYPosition);
                      currentYPosition += 15;
                    }

                  }
                  
                  // End of the observation text's logic.
                  currentYPosition += 20;
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(paragraphText, marginX, currentYPosition);
                  pdf.setFontSize(10);
                  pdf.setFont("helvetica", "normal");
                  currentYPosition += 20;
              } else if (paragraphText.includes("Dr.")) {
                  currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                  pdf.setFontSize(12);
                  pdf.setFont("helvetica", "normal");
                  const drdatalines = paragraphText.split(',').map(line => line.trim()).filter(line => line.length > 0);
                  for (const drdata of drdatalines){
                    pdf.text(drdata, marginX, currentYPosition);
                    currentYPosition += 15;
                  }
                  currentYPosition += 10;
              } else if (paragraphText.includes("X-RAY")) {
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(paragraphText, marginX, currentYPosition);
                  currentYPosition += 20;
              } else if (paragraphText.includes(bullet)) {
                  pdf.setFontSize(12);
                  pdf.setFont("helvetica", "bold");
                  const impressionlines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                  for (const line of impressionlines) {
                    pdf.text(line, marginX, currentYPosition);
                  }
                  currentYPosition += 20;
              } else {
                // Handle text in columnar structure
                const lines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                console.log("These are the lines of the observation :")
                console.log(lines)
                console.log("End of lines of the observation.")
                // Adding the observation text in the array. 
                for (const observationtext of lines){
                  observationArray.push(observationtext);
                }
                // End of the observation text logic.
                
            }
          }              

          currentYPosition = await this.addReportImage(pdf, reportImageUrl, currentYPosition);

          // This is to download the file on the same browser.
          pdf.save(filename ? filename + ".pdf" : "download.pdf");

          const currentURL = window.location.href;

          setTimeout(() => {
              window.location.href = document.referrer + "?nocache=" + Date.now();
          }, 200);

          window.addEventListener("popstate", () => {
              if (window.location.href !== currentURL) {
                  setTimeout(() => {
                      window.location.reload(true);
                  }, 200);
              }
          });

      } catch (error) {
          console.error("Error generating PDF:", error);
          this.showNotification("Error generating PDF. Please try again.");
      } finally {
          this.hideLoader();
      }
    })();
  }

  /////////////////////////////////// Downloading ECG pdf on the browser //////////////////////////////////////

  GetEcgContentOnPDF = async () => {
    // Show the loader before starting the PDF generation
    this.showLoader();
    const filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    
    // Getting the logo and signature from the ck editor.
    const images = data.querySelectorAll("img");
    const signatureElement = images[1];
    const signatureUrl = signatureElement ? signatureElement.src : null;
    const logoElement = images[0];
    const logoUrl = logoElement ? logoElement.src : null;
    console.log("This is the signature Url:", signatureUrl);
    console.log("This is the logo Url:", logoUrl);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Getting the data from the url params:
    const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = this.extractDataFromURL();

    // Logic for creating the pdf.
    const pdf = new jsPDF("p", "pt", "a4");// adding the landscape orientation.

    // Here i will add the logic to add the image on a separate page.
    let currentYPosition = 0;
    currentYPosition = await this.addSeparateImageOnEcg(pdf, reportImageUrl, currentYPosition);
    

    // This is the logic to add the data on the page.
    pdf.addPage();// switching back to portrait.
    // setting the current y position back to 40.
    currentYPosition = 40;

    try{
      currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

      const tableData = [
        ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
        ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
        ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
      ];

      currentYPosition += 20;
      pdf.autoTable({
        startY: currentYPosition,
        body: tableData,
        theme: 'grid',
        styles: {
            cellPadding: 3, 
            fontSize: 10,
        },
      });

      currentYPosition = pdf.previousAutoTable.finalY + 20;

      // Adding the data of paragraphs of the ckeditor.
      const paragraphs = data.querySelectorAll("p");
      const marginX = 40; // Margin from the left side.
      console.log("This is the complete fetched paragraph tag from ckeditor:");
      console.log(paragraphs);
      console.log("End of the paragraphs tag.");

      for (const paragraph of paragraphs) {
        const paragraphText = paragraph.textContent || "";
        console.log("This is the paragraph text :", paragraphText);

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");

        if (paragraphText.includes("ECG")) {
          pdf.text(paragraphText, marginX, currentYPosition);
          currentYPosition += 20;
        } else if (paragraphText.includes("Observation:")) {
          pdf.text(paragraphText, marginX, currentYPosition);
          currentYPosition += 20;
        } else{
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.text(paragraphText, marginX, currentYPosition);
          currentYPosition += 15;
        }

      }

      // Adding the signature on the page.
      currentYPosition = await this.addECGSignature(pdf, signatureUrl, currentYPosition);

      // To download the current pdf on the browser.
      pdf.save(filename ? filename + ".pdf" : "download.pdf");

      const currentURL = window.location.href;

      setTimeout(() => {
          window.location.href = document.referrer + "?nocache=" + Date.now();
      }, 200);

      window.addEventListener("popstate", () => {
          if (window.location.href !== currentURL) {
              setTimeout(() => {
                  window.location.reload(true);
              }, 200);
          }
      });
    } catch (error) {
        console.error("Error generating PDF :", error);
        this.showNotification("Error generating PDF. Please try again.");
    } finally {
        this.hideLoader();
    }
  
  };

  ////////////////////////////////////////////////////////////////////////// UPLOAD ECG PDF //////////////////////////////////////////////////////////////////////////
  // uploadEcgPDF = async () => {

  //   // Show the loader before starting the PDF generation
  //   this.showLoader();
  //   const filename = this.createFilename();
  //   const data = document.getElementsByClassName("ck-editor__editable")[0];
  //   const table = data.querySelector("table");
  //   data.classList.add("ck-blurred");
  //   data.classList.remove("ck-focused");
  //   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  //   // Create a function to load images and render PDF
  //   const loadImageAndRenderPDF = async () => {
  //     try {
  //       let graphSrc = Array.from(data.children).pop().children[0].currentSrc;
  //       let graphElement = document.querySelector(
  //         "figure.image:nth-last-of-type(1)"
  //       );
  //       graphElement.remove();

  //       if (data != undefined) {
  //         var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
  //         var a4Height = 841.89; // A4 height in points

  //         var canvasWidth = a4Width; // Adjusted width to leave some margin
  //         var canvasHeight = a4Height; // Adjusted height to maintain aspect ratio and leave margin

  //         const canvas = await html2canvas(data, {
  //           scale: 2, // Adjust the scale if needed for better quality
  //           useCORS: true, // Enable CORS to capture images from external URLs
  //         });

  //         const imgData = canvas.toDataURL("image/png", 1.0);
  //         const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);

  //         // Calculate the image dimensions to fit within the PDF dimensions
  //         const canvasAspectRatio = canvas.width / canvas.height;
  //         const pdfAspectRatio = a4Width / a4Height;

  //         let pdfImageWidth = canvasWidth;
  //         let pdfImageHeight = canvasHeight;

  //         if (canvasAspectRatio > pdfAspectRatio) {
  //           pdfImageWidth = canvasWidth;
  //           pdfImageHeight = canvasWidth / canvasAspectRatio;
  //         } else {
  //           pdfImageHeight = canvasHeight;
  //           pdfImageWidth = canvasHeight * canvasAspectRatio;
  //         }

  //         // Calculate the positioning to center the image
  //         const xPosition = (pdf.internal.pageSize.width - pdfImageWidth) / 2;
  //         const yPosition = (pdf.internal.pageSize.height - pdfImageHeight) / 2;

  //         // Create a separate canvas for the rotated graph image
  //         const graphCanvas = document.createElement("canvas");
  //         graphCanvas.width = 1024;
  //         graphCanvas.height = 1024;
  //         const graphCtx = graphCanvas.getContext("2d");
  //         let graphImg = await this.getDataUri(graphSrc);
  //         const image = new Image();
  //         image.src = graphImg;

  //         await new Promise((resolve) => {
  //           image.onload = resolve;
  //         });

  //         graphCtx.translate(graphCanvas.width / 2, graphCanvas.height / 2);
  //         graphCtx.rotate(Math.PI / 2); // Rotate the image by 90 degrees
  //         graphCtx.drawImage(
  //           image,
  //           -graphCanvas.height / 2,
  //           -graphCanvas.width / 2,
  //           graphCanvas.height,
  //           graphCanvas.width
  //         );

  //         pdf.addImage(
  //           graphCanvas.toDataURL("image/png"),
  //           "PNG",
  //           0,
  //           0,
  //           a4Width,
  //           a4Height
  //         );

  //         pdf.addPage("a4", "portrait"); // Add a new portrait-oriented page
  //         pdf.addImage(
  //           imgData,
  //           "PNG",
  //           xPosition,
  //           yPosition,
  //           pdfImageWidth,
  //           pdfImageHeight
  //         );

  //         pdf.setTextColor(255, 255, 255);

  //         // Calculate the position to place the text at the bottom
  //         const textX = 40;
  //         const textY = 841.89 - 2; // 20 points from the bottom

  //         // If a table exists within the ck-editor__editable div, capture its text content
  //         if (table) {
  //           const tableText = table.textContent || "";

  //           // Add the table text as text (preserve original formatting)
  //           pdf.setFontSize(2); // Adjust the font size as needed
  //           pdf.text(textX, textY, tableText);
  //         }

  //         // Iterate through all paragraphs in the ck-editor__editable div
  //         const paragraphs = data.querySelectorAll("p");
  //         paragraphs.forEach((paragraph) => {
  //           const paragraphText = paragraph.textContent || "";

  //           // Add each paragraph text as text (preserve original formatting)
  //           pdf.setFontSize(2); // Adjust the font size as needed
  //           pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
  //         });

  //         // Convert the PDF to a Blob
  //         const pdfBlob = pdf.output("blob");

  //         // Extract data from URL
  //         const { patientId, patientName, testDate, reportDate, location } =
  //           extractDataFromURL();

  //         // Send the FormData to Django backend using fetch
  //         const csrfToken = await getCSRFToken();
  //         console.log("CSRF Token:", csrfToken);

  //         // Create FormData and append the PDF Blob
  //         const formData = new FormData();
  //         formData.append(
  //           "pdf",
  //           pdfBlob,
  //           filename ? filename + ".pdf" : "download.pdf"
  //         );
  //         formData.append("patientId", patientId);
  //         formData.append("patientName", patientName);
  //         formData.append("testDate", testDate);
  //         formData.append("reportDate", reportDate);
  //         formData.append("location", location);

  //         console.log("FormData:", formData);

  //         try {
  //           const response = await axios.post("/upload_ecg_pdf/", formData, {
  //             headers: {
  //               "Content-Type": "multipart/form-data",
  //               "X-CSRFToken": csrfToken,
  //             },
  //           });

  //           console.log(
  //             "PDF successfully sent to Django backend.",
  //             response.data
  //           );
  //           // Hide the loader when the PDF is ready
  //           this.hideLoader();
  //           // Show the success notification
  //           showNotification("PDF successfully uploaded!");
  //         } catch (error) {
  //           console.error("Error sending PDF to Django backend.", error);
  //           // Show the error notification
  //           showNotification("Error uploading PDF. Please try again.");
  //         }

  //         //alert("Report Uploaded successfully!");

  //         // Save the current URL before going back in the history
  //         const currentURL = window.location.href;

  //         // Redirect to the previous page after a short delay
  //         await delay(200);

  //         // Navigate back to the previous page with a cache-busting query parameter
  //         window.location.href = document.referrer + "?nocache=" + Date.now();

  //         // Listen for the popstate event to know when the history state changes
  //         window.addEventListener("popstate", () => {
  //           // Check if the URL has changed
  //           if (window.location.href !== currentURL) {
  //             // Reload the current page after a short delay
  //             setTimeout(() => {
  //               window.location.reload(true);
  //             }, 200);
  //           }
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error generating PDF:", error);
  //       // Hide the loader when the PDF is ready
  //     }
  //   };

  //   loadImageAndRenderPDF();
  // };

  // Updated Ecg logic.
  uploadEcgPDF = async () => {

    // Show the loader before starting the PDF generation
    this.showLoader();
    const filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    
    // Getting the logo and signature from the ck editor.
    const images = data.querySelectorAll("img");
    const signatureElement = images[1];
    const signatureUrl = signatureElement ? signatureElement.src : null;
    const logoElement = images[0];
    const logoUrl = logoElement ? logoElement.src : null;
    console.log("This is the signature Url:", signatureUrl);
    console.log("This is the logo Url:", logoUrl);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Getting the data from the url params:
    const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = this.extractDataFromURL();

    // Logic for creating the pdf.
    const pdf = new jsPDF("p", "pt", "a4");// adding the landscape orientation.

    // Here i will add the logic to add the image on a separate page.
    let currentYPosition = 0;
    currentYPosition = await this.addSeparateImageOnEcg(pdf, reportImageUrl, currentYPosition);
    

    // This is the logic to add the data on the page.
    pdf.addPage();// switching back to portrait.
    // setting the current y position back to 40.
    currentYPosition = 40;

    try{
      currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

      const tableData = [
        ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
        ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
        ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
      ];

      currentYPosition += 20;
      pdf.autoTable({
        startY: currentYPosition,
        body: tableData,
        theme: 'grid',
        styles: {
            cellPadding: 3, 
            fontSize: 10,
        },
      });

      currentYPosition = pdf.previousAutoTable.finalY + 20;

      // Adding the data of paragraphs of the ckeditor.
      const paragraphs = data.querySelectorAll("p");
      const marginX = 40; // Margin from the left side.
      console.log("This is the complete fetched paragraph tag from ckeditor:");
      console.log(paragraphs);
      console.log("End of the paragraphs tag.");

      for (const paragraph of paragraphs) {
        const paragraphText = paragraph.textContent || "";
        console.log("This is the paragraph text :", paragraphText);

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");

        if (paragraphText.includes("ECG")) {
          pdf.text(paragraphText, marginX, currentYPosition);
          currentYPosition += 20;
        } else if (paragraphText.includes("Observation:")) {
          pdf.text(paragraphText, marginX, currentYPosition);
          currentYPosition += 20;
        } else{
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.text(paragraphText, marginX, currentYPosition);
          currentYPosition += 15;
        }

      }

      // Adding the signature on the page.
      currentYPosition = await this.addECGSignature(pdf, signatureUrl, currentYPosition);

      // Converting the pdf to blob .
      const pdfBlob = pdf.output("blob");

      try {
        const csrfToken = await this.getCSRFToken();
        const formData = new FormData();
        formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
        formData.append("patientId", patientId);
        formData.append("patientName", patientName);
        formData.append("age", age);
        formData.append("gender", gender);
        formData.append("testDate", testDate);
        formData.append("reportDate", reportDate);
        formData.append("location", location);
        

        await axios.post("/upload_ecg_pdf/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": csrfToken,
            },
        });

        console.log("PDF successfully sent to Django backend.");
        this.showNotification("PDF successfully uploaded!");
      } catch (error) {
        console.error("Error sending PDF to Django backend.", error);
        this.showNotification("Error uploading PDF. Please try again.");
      }

      const currentURL = window.location.href;

      setTimeout(() => {
          window.location.href = document.referrer + "?nocache=" + Date.now();
      }, 200);

      window.addEventListener("popstate", () => {
          if (window.location.href !== currentURL) {
              setTimeout(() => {
                  window.location.reload(true);
              }, 200);
          }
      });
    } catch (error) {
        console.error("Error generating PDF :", error);
        this.showNotification("Error generating PDF. Please try again.");
    } finally {
        this.hideLoader();
    }
  
  };
  //***************************************///////////////////// upload ECG pdf to database (END) ///////////////**********************************************/

  ////////////////////////////////////////////////////////////////////////// UPLOAD XRAY PDF //////////////////////////////////////////////////////////////////////////
  uploadXrayPDF() {
    // const showLoader = () => {
    //   console.log("Showing loader");
    //   const loader = document.querySelector(".loader");
    //   if (loader) {
    //     loader.style.display = "block";
    //   }
    // };

    // const hideLoader = () => {
    //   console.log("Hiding loader");
    //   const loader = document.querySelector(".loader");
    //   if (loader) {
    //     loader.style.display = "none";
    //   }
    // };

    // const extractDataFromURL = () => {
    //   const urlParams = new URLSearchParams(window.location.search);
    //   const patientId = urlParams.get("data-patientid");
    //   const patientName = urlParams.get("data-patientname");
    //   const testDate = urlParams.get("data-testdate");
    //   const reportDate = urlParams.get("data-reportdate");
    //   const location = urlParams.get("data-location");

    //   return { patientId, patientName, testDate, reportDate, location };
    // };

    // const showNotification = (message) => {
    //   const notification = document.getElementById("notification");
    //   const notificationText = document.getElementById("notification-text");

    //   if (notification && notificationText) {
    //     notificationText.innerText = message;
    //     notification.style.display = "block";

    //     // Hide the notification after 3 seconds (adjust the delay as needed)
    //     setTimeout(() => {
    //       notification.style.display = "none";
    //     }, 1000);
    //   }
    // };

    // const getCSRFToken = async () => {
    //   try {
    //     const response = await fetch("/get-csrf-token/");
    //     const data = await response.json();
    //     return data.csrf_token;
    //   } catch (error) {
    //     console.error("Error fetching CSRF token:", error);
    //     throw error;
    //   }
    // };

    // // Show the loader before starting the PDF generation
    // showLoader();
    // const filename = this.createFilename();
    // const data = document.getElementsByClassName("ck-editor__editable")[0];
    // const table = data.querySelector("table");
    // data.classList.add("ck-blurred");
    // data.classList.remove("ck-focused");
    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // // Create a function to load images and render PDF
    // const loadImageAndRenderPDF = async () => {
    //   try {
    //     let graphSrc = Array.from(data.children).pop().children[0].currentSrc;
    //     let graphElement = document.querySelector(
    //       "figure.image:nth-last-of-type(1)"
    //     );
    //     graphElement.remove();

    //     if (data != undefined) {
    //       var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
    //       var a4Height = 841.89; // A4 height in points

    //       var canvasWidth = a4Width; // Adjusted width to leave some margin
    //       var canvasHeight = a4Height; // Adjusted height to maintain aspect ratio and leave margin

    //       const canvas = await html2canvas(data, {
    //         scale: 2, // Adjust the scale if needed for better quality
    //         useCORS: true, // Enable CORS to capture images from external URLs
    //       });

    //       const imgData = canvas.toDataURL("image/png", 1.0);
    //       const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);

    //       // Calculate the image dimensions to fit within the PDF dimensions
    //       const canvasAspectRatio = canvas.width / canvas.height;
    //       const pdfAspectRatio = a4Width / a4Height;

    //       let pdfImageWidth = canvasWidth;
    //       let pdfImageHeight = canvasHeight;

    //       if (canvasAspectRatio > pdfAspectRatio) {
    //         pdfImageWidth = canvasWidth;
    //         pdfImageHeight = canvasWidth / canvasAspectRatio;
    //       } else {
    //         pdfImageHeight = canvasHeight;
    //         pdfImageWidth = canvasHeight * canvasAspectRatio;
    //       }

    //       // Calculate the positioning to center the image
    //       const xPosition = (pdf.internal.pageSize.width - pdfImageWidth) / 2;
    //       const yPosition = (pdf.internal.pageSize.height - pdfImageHeight) / 2;

    //       // Create a separate canvas for the rotated graph image
    //       const graphCanvas = document.createElement("canvas");
    //       graphCanvas.width = 1024;
    //       graphCanvas.height = 1024;
    //       const graphCtx = graphCanvas.getContext("2d");
    //       let graphImg = await this.getDataUri(graphSrc);
    //       const image = new Image();
    //       image.src = graphImg;

    //       await new Promise((resolve) => {
    //         image.onload = resolve;
    //       });

    //       graphCtx.translate(graphCanvas.width / 2, graphCanvas.height / 2);
    //       graphCtx.rotate(Math.PI / 2); // Rotate the image by 90 degrees
    //       graphCtx.drawImage(
    //         image,
    //         -graphCanvas.height / 2,
    //         -graphCanvas.width / 2,
    //         graphCanvas.height,
    //         graphCanvas.width
    //       );

    //       pdf.addImage(
    //         graphCanvas.toDataURL("image/png"),
    //         "PNG",
    //         0,
    //         0,
    //         a4Width,
    //         a4Height
    //       );

    //       pdf.addPage("a4", "portrait"); // Add a new portrait-oriented page
    //       pdf.addImage(
    //         imgData,
    //         "PNG",
    //         xPosition,
    //         yPosition,
    //         pdfImageWidth,
    //         pdfImageHeight
    //       );

    //       pdf.setTextColor(255, 255, 255);

    //       // Calculate the position to place the text at the bottom
    //       const textX = 40;
    //       const textY = 841.89 - 2; // 20 points from the bottom

    //       // If a table exists within the ck-editor__editable div, capture its text content
    //       if (table) {
    //         const tableText = table.textContent || "";

    //         // Add the table text as text (preserve original formatting)
    //         pdf.setFontSize(2); // Adjust the font size as needed
    //         pdf.text(textX, textY, tableText);
    //       }

    //       // Iterate through all paragraphs in the ck-editor__editable div
    //       const paragraphs = data.querySelectorAll("p");
    //       paragraphs.forEach((paragraph) => {
    //         const paragraphText = paragraph.textContent || "";

    //         // Add each paragraph text as text (preserve original formatting)
    //         pdf.setFontSize(2); // Adjust the font size as needed
    //         pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
    //       });

    //       // Convert the PDF to a Blob
    //       const pdfBlob = pdf.output("blob");

    //       // Extract data from URL
    //       const { patientId, patientName, testDate, reportDate, location } =
    //         extractDataFromURL();

    //       // Send the FormData to Django backend using fetch
    //       const csrfToken = await getCSRFToken();
    //       console.log("CSRF Token:", csrfToken);

    //       // Create FormData and append the PDF Blob
    //       const formData = new FormData();
    //       formData.append(
    //         "pdf",
    //         pdfBlob,
    //         filename ? filename + ".pdf" : "download.pdf"
    //       );
    //       formData.append("patientId", patientId);
    //       formData.append("patientName", patientName);
    //       formData.append("testDate", testDate);
    //       formData.append("reportDate", reportDate);
    //       formData.append("location", location);

    //       console.log("FormData:", formData);

    //       try {
    //         const response = await axios.post("/upload_xray_pdf/", formData, {
    //           headers: {
    //             "Content-Type": "multipart/form-data",
    //             "X-CSRFToken": csrfToken,
    //           },
    //         });

    //         console.log(
    //           "PDF successfully sent to Django backend.",
    //           response.data
    //         );
    //         // Hide the loader when the PDF is ready
    //         hideLoader();
    //         // Show the success notification
    //         showNotification("PDF successfully uploaded!");
    //       } catch (error) {
    //         console.error("Error sending PDF to Django backend.", error);
    //         // Show the error notification
    //         showNotification("Error uploading PDF. Please try again.");
    //       }

    //       // Save the current URL before going back in the history
    //       const currentURL = window.location.href;

    //       // Redirect to the previous page after a short delay
    //       await delay(200);

    //       // Navigate back to the previous page with a cache-busting query parameter
    //       window.location.href = document.referrer + "?nocache=" + Date.now();

    //       // Listen for the popstate event to know when the history state changes
    //       window.addEventListener("popstate", () => {
    //         // Check if the URL has changed
    //         if (window.location.href !== currentURL) {
    //           // Reload the current page after a short delay
    //           setTimeout(() => {
    //             window.location.reload(true);
    //           }, 200);
    //         }
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error generating PDF:", error);
    //     // Hide the loader when the PDF is ready
    //   }
    // };

    // loadImageAndRenderPDF();

  (async () => {
    this.showLoader();
    const filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    
    const images = data.querySelectorAll("img");
    const signatureElement = images[1];
    const signatureUrl = signatureElement ? signatureElement.src : null;
    const logoElement = images[0];
    const logoUrl = logoElement ? logoElement.src : null;
    console.log("This is the signature Url:", signatureUrl);
    console.log("This is the logo Url:", logoUrl);

    const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = this.extractDataFromURL();

    const pdf = new jsPDF("p", "pt", "a4");

    // Here i will add the logic to add the image on a separate page.
    let currentYPosition = 40;
    // If i want to add the logo on the first page also.
    currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);
    currentYPosition = 0;
    currentYPosition = await this.addSeparateImageOnXray(pdf, reportImageUrl, currentYPosition);
    
    

    // This is the logic to add the data on the page.
    pdf.addPage();// switching back to portrait.
    // setting the current y position back to 40.
    currentYPosition = 40;

    try {
        currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

        const tableData = [
            ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
            ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
            ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
        ];

        currentYPosition += 20;

        pdf.autoTable({
            startY: currentYPosition,
            body: tableData,
            theme: 'grid',
            styles: {
                cellPadding: 3,
                fontSize: 10,
            },
        });
        currentYPosition = pdf.previousAutoTable.finalY + 20;

        const paragraphs = data.querySelectorAll("p");
        const columnWidth = (pdf.internal.pageSize.width - 80) / 2; // 80 = 40px margin on each side
        let isLeftColumn = true; // Start with left column
        let leftColumnY = 0;
        let rightColumnY = 0;
        const marginX = 40; // Margin from left side
        const columnGap = 10; // Gap between columns
        const bullet = "\u2022 ";
        // For fixing the ckeditor problem i am using this logic - Himanshu.
        const observationArray = [];
        console.log("This is the complete fetched paragraph tag from ckeditor:");
        console.log(paragraphs)
        console.log("End of the paragraphs tag.")
        

        for (const paragraph of paragraphs) {
            const paragraphText = paragraph.textContent || "";
            console.log("These is the paragraph text :", paragraphText);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");

            if (paragraphText.includes("OBSERVATIONS:")) {
                pdf.text(paragraphText, marginX, currentYPosition);
                pdf.setFontSize(13);
                pdf.setFont("helvetica", "normal");
                currentYPosition += 20;
            } else if (paragraphText.includes("IMPRESSION:")) {
                // Adding the logic if the lines are lesser than 6 than they will get printed in the normal manner.
                if (observationArray.length > 5){
                  // Adding the logic to add the observation lines just before the Impression line.
                  // setting the font size and the font family back to normal.
                  pdf.setFontSize(12); 
                  pdf.setFont("helvetica", "normal");
                  const totallines = observationArray.length;
                  const halflines = Math.ceil(totallines / 2);
                  console.log("This is the observation array :", observationArray);

                  // Adding the bullet point to the lines before printing them  on the pdf.
                  const addBulletPoint = (line) => {
                    if (line.startsWith(bullet)) {
                        return line;
                    }
                    return bullet + line;
                  };

                  // setting the left column and right column logic (left one is not needed, i can optimise it later.)
                  rightColumnY = currentYPosition;
                  leftColumnY = currentYPosition;

                  // Processing the texts which will fix the line text width greater than the column width issue.
                  const processTextColumn = (text, x, y, columnWidth) => {
                    let currentY = y;
                    const textWidth = pdf.getTextWidth(text);
                    const maxWidth = columnWidth - 20; // Padding for each column
                    console.log("This is the current y (at the beginning of processing the new line of array ) :", currentY);
                    console.log("This is the textWidth :", textWidth);
                    console.log("This is the maxwidth :", maxWidth);
            
                    if (textWidth > maxWidth) {
                      let remainingText = text;
                      pdf.setFont("helvetica", "normal");
                      let currentLine = '';
                  
                      // Split text into words
                      const words = remainingText.split(' ');
                  
                      for (const word of words) {
                          // Construct a test line with the next word
                          const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
                          console.log("This is the testline :", testLine);
                          const testLineWidth = pdf.getTextWidth(testLine);
                  
                          if (testLineWidth > maxWidth) {
                              // If it exceeds the width, print the current line
                              if (currentLine.length > 0) {
                                  console.log("if the current line is greater than the maxwidth and is having some data:");
                                  console.log("This is the current line", currentLine);
                                  pdf.text(currentLine, x, currentY);
                                  currentY += 15; // Move down for the next line
                                  console.log("This is the current y :", currentY);
                              }
                              // Start a new line with the current word
                              currentLine = "  " + word; // Reset current line to the word that caused overflow
                              console.log("This is the remaining word or sentence added with a space here :", currentLine);
                              
                          } else {
                              // If it fits, update the current line
                              currentLine = testLine;
                          }
                      }
                  
                      // Print any remaining text in currentLine
                      if (currentLine.length > 0) {
                          pdf.text(currentLine, x, currentY);
                          console.log("Printing any current line if left :", currentLine);
                          console.log("This is the current y updated on the remaining text code :", currentY);
                      }
                    } else {
                        pdf.text(text, x, currentY);
                        console.log("Adding the text directly because it doesn't need separation :", text);
                        console.log("the current y for directly added text:", currentY);
                    }

                    console.log("This is the current Y before just coming out of the process (return currenty +15) :", currentY);
                    
                    return currentY + 15;
                  
                  };

                  // Adding the lines to the respective side along with the bullet points. 
                  for (let i = 0; i < totallines; i++) {
                    const lineWithBullet = addBulletPoint(observationArray[i]);
                    console.log("These are the observation array lines given one by one :");
                    console.log(lineWithBullet);
                    console.log("End of the observation array separated lines.");
                    if (i < halflines) {
                        leftColumnY = processTextColumn(lineWithBullet, marginX, leftColumnY, columnWidth);
                    } else {
                        rightColumnY = processTextColumn(lineWithBullet, marginX + columnWidth + columnGap, rightColumnY, columnWidth);
                    }
                  }
                  currentYPosition = Math.max(leftColumnY, rightColumnY);
                  console.log("This is the right Column y :", rightColumnY);
                  console.log("This is the left column y :", leftColumnY);
                  console.log("This is the current y position :", currentYPosition);
                } else {

                  // Adding the bullet point.
                  const addBulletPoint = (line) => {
                    if (line.startsWith(bullet)) {
                        return line;
                    }
                    return bullet + line;
                  };

                  // Now adding the texts in normal manner.
                  for (const line of observationArray){
                    const lineWithBullet = addBulletPoint(line);
                    pdf.text(lineWithBullet, marginX, currentYPosition);
                    currentYPosition += 15;
                  }

                }
                
                // End of the observation text's logic.
                currentYPosition += 20;
                pdf.setFontSize(13);
                pdf.setFont("helvetica", "bold");
                pdf.text(paragraphText, marginX, currentYPosition);
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                currentYPosition += 20;
            } else if (paragraphText.includes("Dr.")) {
                currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "normal");
                const drdatalines = paragraphText.split(',').map(line => line.trim()).filter(line => line.length > 0);
                for (const drdata of drdatalines){
                  pdf.text(drdata, marginX, currentYPosition);
                  currentYPosition += 15;
                }
                currentYPosition += 10;
            } else if (paragraphText.includes("X-RAY")) {
                pdf.setFontSize(13);
                pdf.setFont("helvetica", "bold");
                pdf.text(paragraphText, marginX, currentYPosition);
                currentYPosition += 20;
            } else if (paragraphText.includes(bullet)) {
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                const impressionlines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                for (const line of impressionlines) {
                  pdf.text(line, marginX, currentYPosition);
                }
                currentYPosition += 20;
            } else {
              // Handle text in columnar structure
              const lines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
              console.log("These are the lines of the observation :")
              console.log(lines)
              console.log("End of lines of the observation.")
              // Adding the observation text in the array. 
              for (const observationtext of lines){
                observationArray.push(observationtext);
              }
              // End of the observation text logic.
              
          }
        }              

        
        const pdfBlob = pdf.output("blob");

        try {
            const csrfToken = await this.getCSRFToken();
            const formData = new FormData();
            formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
            formData.append("patientId", patientId);
            formData.append("patientName", patientName);
            formData.append("age", age);
            formData.append("gender", gender);
            formData.append("testDate", testDate);
            formData.append("reportDate", reportDate);
            formData.append("location", location);
            formData.append("accession", accession);

            await axios.post("/upload_xray_pdf/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-CSRFToken": csrfToken,
                },
            });

            console.log("PDF successfully sent to Django backend.");
            this.showNotification("PDF successfully uploaded!");
        } catch (error) {
            console.error("Error sending PDF to Django backend.", error);
            this.showNotification("Error uploading PDF. Please try again.");
        }

        const currentURL = window.location.href;

        setTimeout(() => {
            window.location.href = document.referrer + "?nocache=" + Date.now();
        }, 200);

        window.addEventListener("popstate", () => {
            if (window.location.href !== currentURL) {
                setTimeout(() => {
                    window.location.reload(true);
                }, 200);
            }
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        this.showNotification("Error generating PDF. Please try again.");
    } finally {
        this.hideLoader();
    }
  })();
  }
  //***************************************///////////////////// upload split XRAY pdf to database (END) ///////////////**********************************************/

  ////////////////////////////////// Upload XRAY PDF without IMAGE (START) ////////////////////////
  // UploadDivContentOnPDFWithoutImage() {
  //   const showLoader = () => {
  //     console.log("Showing loader");
  //     const loader = document.querySelector(".loader");
  //     if (loader) {
  //       loader.style.display = "block";
  //     }
  //   };

  //   const hideLoader = () => {
  //     console.log("Hiding loader");
  //     const loader = document.querySelector(".loader");
  //     if (loader) {
  //       loader.style.display = "none";
  //     }
  //   };

  //   const extractDataFromURL = () => {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const patientId = urlParams.get("data-patientid");
  //     const patientName = urlParams.get("data-patientname");
  //     const testDate = urlParams.get("data-testdate");
  //     const reportDate = urlParams.get("data-reportdate");
  //     const location = urlParams.get("data-location");
  //     const accession = urlParams.get("data-accession");

  //     return { patientId, patientName, testDate, reportDate, location, accession };
  //   };

  //   const showNotification = (message) => {
  //     const notification = document.getElementById("notification");
  //     const notificationText = document.getElementById("notification-text");

  //     if (notification && notificationText) {
  //       notificationText.innerText = message;
  //       notification.style.display = "block";

  //       // Hide the notification after 3 seconds (adjust the delay as needed)
  //       setTimeout(() => {
  //         notification.style.display = "none";
  //       }, 1000);
  //     }
  //   };

  //   const getCSRFToken = async () => {
  //     try {
  //       const response = await fetch("/get-csrf-token/");
  //       const data = await response.json();
  //       return data.csrf_token;
  //     } catch (error) {
  //       console.error("Error fetching CSRF token:", error);
  //       throw error;
  //     }
  //   };
  //   // Show the loader before starting the PDF generation
  //   showLoader();
  //   var filename = this.createFilename();
  //   const data = document.getElementsByClassName("ck-editor__editable")[0];
  //   const table = data.querySelector("table");
  //   data.classList.add("ck-blurred");
  //   data.classList.remove("ck-focused");
  //   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  //   // Remove the last image element from the capture
  //   const images = data.querySelectorAll("img");
  //   if (images.length > 0) {
  //     const lastImage = images[images.length - 1];
  //     lastImage.style.display = "none"; // Hide the last image
  //   }

  //   if (data != undefined) {
  //     var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
  //     var a4Height = 841.89; // A4 height in points

  //     var canvasWidth = a4Width - 40; // Adjusted width to leave some margin

  //     html2canvas(data, {
  //       scale: 4, // Adjust the scale if needed for better quality
  //       windowWidth: document.body.scrollWidth,
  //       windowHeight: document.body.scrollHeight,
  //     }).then(async (canvas) => {
  //       const imgData = canvas.toDataURL("image/png", 1.0);

  //       // Calculate the height based on the aspect ratio of the captured image
  //       const canvasHeight = (canvasWidth / canvas.width) * canvas.height;

  //       // Show the last image again
  //       if (images.length > 0) {
  //         const lastImage = images[images.length - 1];
  //         lastImage.style.display = "block";
  //       }

  //       // Hide the loader when the PDF is ready
  //       hideLoader();

  //       // Create PDF with only the captured content
  //       const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);
  //       pdf.addImage(imgData, "PNG", 20, 20, canvasWidth, canvasHeight);

  //       pdf.setTextColor(255, 255, 255);

  //       // Calculate the position to place the text at the bottom
  //       const textX = 40;
  //       const textY = 841.89 - 2; // 20 points from the bottom

  //       // If a table exists within the ck-editor__editable div, capture its text content
  //       if (table) {
  //         const tableText = table.textContent || "";

  //         // Add the table text as text (preserve original formatting)
  //         pdf.setFontSize(2); // Adjust the font size as needed
  //         pdf.text(textX, textY, tableText);
  //       }

  //       // Iterate through all paragraphs in the ck-editor__editable div
  //       const paragraphs = data.querySelectorAll("p");
  //       paragraphs.forEach((paragraph) => {
  //         const paragraphText = paragraph.textContent || "";

  //         // Add each paragraph text as text (preserve original formatting)
  //         pdf.setFontSize(2); // Adjust the font size as needed
  //         pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
  //       });

  //       // Convert the PDF to a Blob
  //       const pdfBlob = pdf.output("blob");

  //       // Extract data from URL
  //       const { patientId, patientName, testDate, reportDate, location, accession } =
  //         extractDataFromURL();

  //       // Send the FormData to Django backend using fetch
  //       const csrfToken = await getCSRFToken();
  //       console.log("CSRF Token:", csrfToken);

  //       // Create FormData and append the PDF Blob
  //       const formData = new FormData();
  //       formData.append(
  //         "pdf",
  //         pdfBlob,
  //         filename ? filename + ".pdf" : "download.pdf"
  //       );
  //       formData.append("patientId", patientId);
  //       formData.append("patientName", patientName);
  //       formData.append("testDate", testDate);
  //       formData.append("reportDate", reportDate);
  //       formData.append("location", location);
  //       formData.append("accession", accession);
        

  //       console.log("FormData:", formData);

  //       try {
  //         const response = await axios.post("/upload_xray_pdf/", formData, {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //             "X-CSRFToken": csrfToken,
  //           },
  //         });

  //         console.log(
  //           "PDF successfully sent to Django backend.",
  //           response.data
  //         );
  //         // Hide the loader when the PDF is ready
  //         hideLoader();
  //         // Show the success notification
  //         showNotification("PDF successfully uploaded!");
  //       } catch (error) {
  //         console.error("Error sending PDF to Django backend.", error);
  //         // Show the error notification
  //         showNotification("Error uploading PDF. Please try again.");
  //       }

  //       // Save the current URL before going back in the history
  //       const currentURL = window.location.href;

  //       // Redirect to the previous page after a short delay
  //       await delay(200);

  //       // Navigate back to the previous page with a cache-busting query parameter
  //       window.location.href = document.referrer + "?nocache=" + Date.now();

  //       // Listen for the popstate event to know when the history state changes
  //       window.addEventListener("popstate", () => {
  //         // Check if the URL has changed
  //         if (window.location.href !== currentURL) {
  //           // Reload the current page after a short delay
  //           setTimeout(() => {
  //             window.location.reload(true);
  //           }, 200);
  //         }
  //       });
  //     });
  //   }
  // }

  UploadDivContentOnPDFWithoutImage() {

  // All the common elements are coming from the class using the this keyword.
  (async () => {
      this.showLoader();
      const filename = this.createFilename();
      const data = document.getElementsByClassName("ck-editor__editable")[0];
      
      const images = data.querySelectorAll("img");
      const signatureElement = images[1];
      const signatureUrl = signatureElement ? signatureElement.src : null;
      const logoElement = images[0];
      const logoUrl = logoElement ? logoElement.src : null;
      console.log("This is the signature Url:", signatureUrl);
      console.log("This is the logo Url:", logoUrl);

      const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = this.extractDataFromURL();

      const pdf = new jsPDF("p", "pt", "a4");

      let currentYPosition = 40;

      try {
          currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

          const tableData = [
              ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
              ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
              ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
          ];

          currentYPosition += 20;

          pdf.autoTable({
              startY: currentYPosition,
              body: tableData,
              theme: 'grid',
              styles: {
                  cellPadding: 3,
                  fontSize: 10,
              },
          });
          currentYPosition = pdf.previousAutoTable.finalY + 20;

          const paragraphs = data.querySelectorAll("p");
          const columnWidth = (pdf.internal.pageSize.width - 80) / 2; // 80 = 40px margin on each side
          let isLeftColumn = true; // Start with left column
          let leftColumnY = 0;
          let rightColumnY = 0;
          const marginX = 40; // Margin from left side
          const columnGap = 10; // Gap between columns
          const bullet = "\u2022 ";
          // For fixing the ckeditor problem i am using this logic - Himanshu.
          const observationArray = [];
          console.log("This is the complete fetched paragraph tag from ckeditor:");
          console.log(paragraphs)
          console.log("End of the paragraphs tag.")
          

          for (const paragraph of paragraphs) {
              const paragraphText = paragraph.textContent || "";
              console.log("These is the paragraph text :", paragraphText);

              pdf.setFontSize(12);
              pdf.setFont("helvetica", "bold");

              if (paragraphText.includes("OBSERVATIONS:")) {
                  pdf.text(paragraphText, marginX, currentYPosition);
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "normal");
                  currentYPosition += 20;
              } else if (paragraphText.includes("IMPRESSION:")) {
                  // Adding the logic if the lines are lesser than 6 than they will get printed in the normal manner.
                  if (observationArray.length > 5){
                  // Adding the logic to add the observation lines just before the Impression line.
                  // setting the font size and the font family back to normal.
                  pdf.setFontSize(12); 
                  pdf.setFont("helvetica", "normal");
                  const totallines = observationArray.length;
                  const halflines = Math.ceil(totallines / 2);
                  console.log("This is the observation array :", observationArray);

                  // Adding the bullet point to the lines before printing them  on the pdf.
                  const addBulletPoint = (line) => {
                    if (line.startsWith(bullet)) {
                        return line;
                    }
                    return bullet + line;
                  };

                  // setting the left column and right column logic (left one is not needed, i can optimise it later.)
                  rightColumnY = currentYPosition;
                  leftColumnY = currentYPosition;

                  // Processing the texts which will fix the line text width greater than the column width issue.
                  const processTextColumn = (text, x, y, columnWidth) => {
                    let currentY = y;
                    const textWidth = pdf.getTextWidth(text);
                    const maxWidth = columnWidth - 20; // Padding for each column
                    console.log("This is the current y (at the beginning of processing the new line of array ) :", currentY);
                    console.log("This is the textWidth :", textWidth);
                    console.log("This is the maxwidth :", maxWidth);
            
                    if (textWidth > maxWidth) {
                      let remainingText = text;
                      pdf.setFont("helvetica", "normal");
                      let currentLine = '';
                  
                      // Split text into words
                      const words = remainingText.split(' ');
                  
                      for (const word of words) {
                          // Construct a test line with the next word
                          const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
                          console.log("This is the testline :", testLine);
                          const testLineWidth = pdf.getTextWidth(testLine);
                  
                          if (testLineWidth > maxWidth) {
                              // If it exceeds the width, print the current line
                              if (currentLine.length > 0) {
                                  console.log("if the current line is greater than the maxwidth and is having some data:");
                                  console.log("This is the current line", currentLine);
                                  pdf.text(currentLine, x, currentY);
                                  currentY += 15; // Move down for the next line
                                  console.log("This is the current y :", currentY);
                              }
                              // Start a new line with the current word
                              currentLine = "  " + word; // Reset current line to the word that caused overflow
                              console.log("This is the remaining word or sentence added with a space here :", currentLine);
                              
                          } else {
                              // If it fits, update the current line
                              currentLine = testLine;
                          }
                      }
                  
                      // Print any remaining text in currentLine
                      if (currentLine.length > 0) {
                          pdf.text(currentLine, x, currentY);
                          console.log("Printing any current line if left :", currentLine);
                          console.log("This is the current y updated on the remaining text code :", currentY);
                      }
                    } else {
                        pdf.text(text, x, currentY);
                        console.log("Adding the text directly because it doesn't need separation :", text);
                        console.log("the current y for directly added text:", currentY);
                    }

                    console.log("This is the current Y before just coming out of the process (return currenty +15) :", currentY);
                    
                    return currentY + 15;
                  
                  };

                  // Adding the lines to the respective side along with the bullet points. 
                  for (let i = 0; i < totallines; i++) {
                    const lineWithBullet = addBulletPoint(observationArray[i]);
                    console.log("These are the observation array lines given one by one :");
                    console.log(lineWithBullet);
                    console.log("End of the observation array separated lines.");
                    if (i < halflines) {
                        leftColumnY = processTextColumn(lineWithBullet, marginX, leftColumnY, columnWidth);
                    } else {
                        rightColumnY = processTextColumn(lineWithBullet, marginX + columnWidth + columnGap, rightColumnY, columnWidth);
                    }
                  }
                  currentYPosition = Math.max(leftColumnY, rightColumnY);
                  console.log("This is the right Column y :", rightColumnY);
                  console.log("This is the left column y :", leftColumnY);
                  console.log("This is the current y position :", currentYPosition);
                } else {

                  // Adding the bullet point.
                  const addBulletPoint = (line) => {
                    if (line.startsWith(bullet)) {
                        return line;
                    }
                    return bullet + line;
                  };

                  // Now adding the texts in normal manner.
                  for (const line of observationArray){
                    const lineWithBullet = addBulletPoint(line);
                    pdf.text(lineWithBullet, marginX, currentYPosition);
                    currentYPosition += 15;
                  }

                }
                
                // End of the observation text's logic.
                currentYPosition += 20;
                pdf.setFontSize(13);
                pdf.setFont("helvetica", "bold");
                pdf.text(paragraphText, marginX, currentYPosition);
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                currentYPosition += 20;
              } else if (paragraphText.includes("Dr.")) {
                  currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                  pdf.setFontSize(12);
                  pdf.setFont("helvetica", "normal");
                  const drdatalines = paragraphText.split(',').map(line => line.trim()).filter(line => line.length > 0);
                  for (const drdata of drdatalines){
                    pdf.text(drdata, marginX, currentYPosition);
                    currentYPosition += 15;
                  }
                  currentYPosition += 10;
              } else if (paragraphText.includes("X-RAY")) {
                  pdf.setFontSize(13);
                  pdf.setFont("helvetica", "bold");
                  pdf.text(paragraphText, marginX, currentYPosition);
                  currentYPosition += 20;
              } else if (paragraphText.includes(bullet)) {
                  pdf.setFontSize(12);
                  pdf.setFont("helvetica", "bold");
                  const impressionlines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                  for (const line of impressionlines) {
                    pdf.text(line, marginX, currentYPosition);
                  }
                  currentYPosition += 20;
              } else {
                // Handle text in columnar structure
                const lines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                console.log("These are the lines of the observation :")
                console.log(lines)
                console.log("End of lines of the observation.")
                // Adding the observation text in the array. 
                for (const observationtext of lines){
                  observationArray.push(observationtext);
                }
                // End of the observation text logic.
                
            }
          }              
          // Adding the data to blob to send it to backend.
          const pdfBlob = pdf.output("blob");

          try {
              const csrfToken = await this.getCSRFToken();
              const formData = new FormData();
              formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
              formData.append("patientId", patientId);
              formData.append("patientName", patientName);
              formData.append("age", age);
              formData.append("gender", gender);
              formData.append("testDate", testDate);
              formData.append("reportDate", reportDate);
              formData.append("location", location);
              formData.append("accession", accession);

              await axios.post("/upload_xray_pdf/", formData, {
                  headers: {
                      "Content-Type": "multipart/form-data",
                      "X-CSRFToken": csrfToken,
                  },
              });

              console.log("PDF successfully sent to Django backend.");
              this.showNotification("PDF successfully uploaded!");
          } catch (error) {
              console.error("Error sending PDF to Django backend.", error);
              this.showNotification("Error uploading PDF. Please try again.");
          }

          const currentURL = window.location.href;

          setTimeout(() => {
              window.location.href = document.referrer + "?nocache=" + Date.now();
          }, 200);

          window.addEventListener("popstate", () => {
              if (window.location.href !== currentURL) {
                  setTimeout(() => {
                      window.location.reload(true);
                  }, 200);
              }
          });

      } catch (error) {
          console.error("Error generating PDF:", error);
          this.showNotification("Error generating PDF. Please try again.");
      } finally {
          this.hideLoader();
      }
  })();
}


// UploadDivContentOnPDFWithoutImage = function() {
//   console.log("Entered the required function.");

//   function showLoader() {
//       console.log("Showing loader");
//       var loader = document.querySelector(".loader");
//       if (loader) {
//           loader.style.display = "block";
//       }
//   }

//   function hideLoader() {
//       console.log("Hiding loader");
//       var loader = document.querySelector(".loader");
//       if (loader) {
//           loader.style.display = "none";
//       }
//   }

//   function extractDataFromURL() {
//       var urlParams = new URLSearchParams(window.location.search);
//       console.log("Entered the extract data from the urlparams.");
//       return {
//           patientId: urlParams.get("data-patientid"),
//           patientName: urlParams.get("data-patientname"),
//           testDate: urlParams.get("data-testdate"),
//           reportDate: urlParams.get("data-reportdate"),
//           location: urlParams.get("data-location"),
//           accession: urlParams.get("data-accession")
//       };
//   }

//   function showNotification(message) {
//       console.log("Inside the showNotification function.");
//       var notification = document.getElementById("notification");
//       var notificationText = document.getElementById("notification-text");

//       if (notification && notificationText) {
//           notificationText.innerText = message;
//           notification.style.display = "block";

//           setTimeout(function() {
//               notification.style.display = "none";
//           }, 1000);
//       }
//   }

//   function getCSRFToken(callback) {
//       console.log("inside the getcsrf token function.");
//       var xhr = new XMLHttpRequest();
//       xhr.open("GET", "/get-csrf-token/", true);
//       xhr.onload = function() {
//           if (xhr.status === 200) {
//               var data = JSON.parse(xhr.responseText);
//               callback(null, data.csrf_token);
//           } else {
//               callback("Error fetching CSRF token");
//           }
//       };
//       xhr.onerror = function() {
//           callback("Error fetching CSRF token");
//       };
//       xhr.send();
//   }

//   console.log("Calling the showloader function.");

//   // Show the loader before starting the PDF generation
//   showLoader();

//   // Create filename
//   var filename = this.createFilename();

//   // Fetch the content from CKEditor
//   var data = document.getElementsByClassName("ck-editor__editable")[0];
//   var table = data.querySelector("table");
//   data.classList.add("ck-blurred");
//   data.classList.remove("ck-focused");

//   // Extract paragraphs and table text
//   var paragraphs = Array.prototype.slice.call(data.querySelectorAll("p")).map(function(p) {
//       return p.textContent || "";
//   });
//   var tableText = table ? table.textContent || "" : "";

//   console.log("Calling the hide loader now.");

//   // Hide the loader
//   hideLoader();

//   console.log("Create pdf line.");

//   // Create the PDF document
//   var pdfDocument = <MyPDFDocument paragraphs={paragraphs} tableText={tableText} />;
  
//   console.log("PDF Document:", pdfDocument);

//   console.log("Now entering the pdfdocument to blob conversion line.");

//   // Generate the PDF and convert it to a Blob
//   pdf(pdfDocument).toBlob()
//       .then((blob) => {
//           console.log("inside the conversion to blob functionality.");
//           console.log("Generated Blob:", blob);

//           var url = URL.createObjectURL(blob);
//           var formData = new FormData();
//           formData.append("pdf", blob, filename ? filename + ".pdf" : "download.pdf");

//           // Extract data from URL
//           var dataFromURL = extractDataFromURL();
//           for (var key in dataFromURL) {
//               if (dataFromURL.hasOwnProperty(key)) {
//                   formData.append(key, dataFromURL[key]);
//               }
//           }

//           console.log("now calling the getcsrf function.");

//           // Send the FormData to Django backend using axios
//           getCSRFToken(function(error, csrfToken) {
//               if (error) {
//                   console.error(error);
//                   showNotification("Error fetching CSRF token.");
//                   return;
//               }

//               console.log("CSRF Token:", csrfToken);

//               axios.post("/upload_xray_pdf/", formData, {
//                   headers: {
//                       "Content-Type": "multipart/form-data",
//                       "X-CSRFToken": csrfToken
//                   }
//               }).then(function(response) {
//                   console.log("PDF successfully sent to Django backend.", response.data);
//                   showNotification("PDF successfully uploaded!");
//               }).catch(function(error) {
//                   console.error("Error sending PDF to Django backend.", error);
//                   showNotification("Error uploading PDF. Please try again.");
//               }).finally(function() {
//                   // Save the current URL before going back in the history
//                   var currentURL = window.location.href;

//                   // Redirect to the previous page after a short delay
//                   setTimeout(function() {
//                       window.location.href = document.referrer + "?nocache=" + Date.now();
//                   }, 200);

//                   // Listen for the popstate event to know when the history state changes
//                   window.addEventListener("popstate", function() {
//                       // Check if the URL has changed
//                       if (window.location.href !== currentURL) {
//                           // Reload the current page after a short delay
//                           setTimeout(function() {
//                               window.location.reload(true);
//                           }, 200);
//                       }
//                   });
//               });
//           });
//       }).catch(function(error) {
//           console.error("Error generating PDF", error);
//       });
// };


  ////////////////////////////////// Upload XRAY PDF without IMAGE (END) ////////////////////////

  ////////////////////////////////// Upload XRAY PDF with IMAGE (START) ////////////////////////
  // UploadDivContentOnPDF() {
  //   const showLoader = () => {
  //     console.log("Showing loader");
  //     const loader = document.querySelector(".loader");
  //     if (loader) {
  //       loader.style.display = "block";
  //     }
  //   };

  //   const hideLoader = () => {
  //     console.log("Hiding loader");
  //     const loader = document.querySelector(".loader");
  //     if (loader) {
  //       loader.style.display = "none";
  //     }
  //   };

  //   const extractDataFromURL = () => {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const patientId = urlParams.get("data-patientid");
  //     const patientName = urlParams.get("data-patientname");
  //     const testDate = urlParams.get("data-testdate");
  //     const reportDate = urlParams.get("data-reportdate");
  //     const location = urlParams.get("data-location");
  //     const accession = urlParams.get("data-accession");

  //     return { patientId, patientName, testDate, reportDate, location, accession };
  //   };

  //   const showNotification = (message) => {
  //     const notification = document.getElementById("notification");
  //     const notificationText = document.getElementById("notification-text");

  //     if (notification && notificationText) {
  //       notificationText.innerText = message;
  //       notification.style.display = "block";

  //       // Hide the notification after 3 seconds (adjust the delay as needed)
  //       setTimeout(() => {
  //         notification.style.display = "none";
  //       }, 1000);
  //     }
  //   };

  //   const getCSRFToken = async () => {
  //     try {
  //       const response = await fetch("/get-csrf-token/");
  //       const data = await response.json();
  //       return data.csrf_token;
  //     } catch (error) {
  //       console.error("Error fetching CSRF token:", error);
  //       throw error;
  //     }
  //   };
  //   // Show the loader before starting the PDF generation
  //   showLoader();
  //   var filename = this.createFilename();
  //   const data = document.getElementsByClassName("ck-editor__editable")[0];
  //   const table = data.querySelector("table");
  //   data.classList.add("ck-blurred");
  //   data.classList.remove("ck-focused");
  //   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  //   if (data != undefined) {
  //     // Create a new jsPDF instance
  //     const pdf = new jsPDF("p", "pt", [595.28, 841.89], true); // A4 dimensions

  //     // Capture the entire content, including text and images
  //     html2canvas(data, {
  //       scale: 2, // Adjust the scale if needed for better image quality
  //       useCORS: true, // Added to address potential CORS issues
  //     }).then(async (canvas) => {
  //       const imgData = canvas.toDataURL("image/png", 1.0);

  //       // Calculate the position to center the image
  //       const imgWidth = 595.28 - 40; // Adjusted width to leave some margin
  //       const imgHeight = imgWidth * 1.5 - 40; // Adjusted height to maintain aspect ratio and leave margin
  //       const imgX = (595.28 - imgWidth) / 2;
  //       const imgY = (841.89 - imgHeight) / 2;

  //       // Hide the loader when the PDF is ready
  //       hideLoader();
  //       // Add the image to the PDF
  //       pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);
  //       pdf.setTextColor(255, 255, 255);
  //       // Calculate the position to place the text at the bottom
  //       const textX = 40;
  //       const textY = 841.89 - 2; // 20 points from the bottom

  //       // If a table exists within the ck-editor__editable div, capture its text content
  //       if (table) {
  //         const tableText = table.textContent || "";

  //         // Add the table text as text (preserve original formatting)
  //         pdf.setFontSize(2); // Adjust the font size as needed
  //         pdf.text(textX, textY, tableText);
  //       }

  //       // If the ck-editor__editable div contains paragraphs, capture the text from the first paragraph
  //       const paragraphs = data.querySelectorAll("p");
  //       paragraphs.forEach((paragraph) => {
  //         const paragraphText = paragraph.textContent || "";

  //         // Add each paragraph text as text (preserve original formatting)
  //         pdf.setFontSize(2); // Adjust the font size as needed
  //         pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
  //       });

  //       // Convert the PDF to a Blob
  //       const pdfBlob = pdf.output("blob");

  //       // Extract data from URL
  //       const { patientId, patientName, testDate, reportDate, location, accession } =
  //         extractDataFromURL();

  //       // Send the FormData to Django backend using fetch
  //       const csrfToken = await getCSRFToken();
  //       console.log("CSRF Token:", csrfToken);

  //       // Create FormData and append the PDF Blob
  //       const formData = new FormData();
  //       formData.append(
  //         "pdf",
  //         pdfBlob,
  //         filename ? filename + ".pdf" : "download.pdf"
  //       );
  //       formData.append("patientId", patientId);
  //       formData.append("patientName", patientName);
  //       formData.append("testDate", testDate);
  //       formData.append("reportDate", reportDate);
  //       formData.append("location", location);
  //       formData.append("accession", accession);

  //       console.log("FormData:", formData);

  //       try {
  //         const response = await axios.post("/upload_xray_pdf/", formData, {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //             "X-CSRFToken": csrfToken,
  //           },
  //         });

  //         console.log(
  //           "PDF successfully sent to Django backend.",
  //           response.data
  //         );
  //         // Hide the loader when the PDF is ready
  //         hideLoader();
  //         // Show the success notification
  //         showNotification("PDF successfully uploaded and sent to WhatsApp!");
  //       } catch (error) {
  //         console.error("Error sending PDF to Django backend.", error);
  //         // Show the error notification
  //         showNotification("Error uploading PDF. Please try again.");
  //       }

  //       // Save the current URL before going back in the history
  //       const currentURL = window.location.href;

  //       // Redirect to the previous page after a short delay
  //       await delay(200);

  //       // Navigate back to the previous page with a cache-busting query parameter
  //       window.location.href = document.referrer + "?nocache=" + Date.now();

  //       // Listen for the popstate event to know when the history state changes
  //       window.addEventListener("popstate", () => {
  //         // Check if the URL has changed
  //         if (window.location.href !== currentURL) {
  //           // Reload the current page after a short delay
  //           setTimeout(() => {
  //             window.location.reload(true);
  //           }, 200);
  //         }
  //       });
  //     });
  //   }
  // }
  
  UploadDivContentOnPDF() {

    (async () => {
        this.showLoader();
        const filename = this.createFilename();
        const data = document.getElementsByClassName("ck-editor__editable")[0];
        
        const images = data.querySelectorAll("img");
        const signatureElement = images[1];
        const signatureUrl = signatureElement ? signatureElement.src : null;
        const logoElement = images[0];
        const logoUrl = logoElement ? logoElement.src : null;
        console.log("This is the signature Url:", signatureUrl);
        console.log("This is the logo Url:", logoUrl);

        const { patientId, patientName, age, gender, testDate, reportDate, location, accession, reportImageUrl } = this.extractDataFromURL();

        const pdf = new jsPDF("p", "pt", "a4");

        let currentYPosition = 40;

        try {
            currentYPosition = await this.addLogo(pdf, logoUrl, currentYPosition);

            const tableData = [
                ["Patient Name:", patientName || "N/A", "Patient ID:", patientId || "N/A"],
                ["Patient Age:", age || "N/A", "Patient Gender:", gender || "N/A"],
                ["Test Date:", testDate || "N/A", "Report Date:", reportDate || "N/A"]
            ];

            currentYPosition += 20;

            pdf.autoTable({
                startY: currentYPosition,
                body: tableData,
                theme: 'grid',
                styles: {
                    cellPadding: 3,
                    fontSize: 10,
                },
            });
            currentYPosition = pdf.previousAutoTable.finalY + 20;

            const paragraphs = data.querySelectorAll("p");
            const columnWidth = (pdf.internal.pageSize.width - 80) / 2; // 80 = 40px margin on each side
            let isLeftColumn = true; // Start with left column
            let leftColumnY = 0;
            let rightColumnY = 0;
            const marginX = 40; // Margin from left side
            const columnGap = 10; // Gap between columns
            const bullet = "\u2022 ";
            // For fixing the ckeditor problem i am using this logic - Himanshu.
            const observationArray = [];
            console.log("This is the complete fetched paragraph tag from ckeditor:");
            console.log(paragraphs)
            console.log("End of the paragraphs tag.")
            

            for (const paragraph of paragraphs) {
                const paragraphText = paragraph.textContent || "";
                console.log("These is the paragraph text :", paragraphText);

                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");

                if (paragraphText.includes("OBSERVATIONS:")) {
                    pdf.text(paragraphText, marginX, currentYPosition);
                    pdf.setFontSize(13);
                    pdf.setFont("helvetica", "normal");
                    currentYPosition += 20;
                } else if (paragraphText.includes("IMPRESSION:")) {
                    // Adding the logic if the lines are lesser than 6 than they will get printed in the normal manner.
                    if (observationArray.length > 5){
                      // Adding the logic to add the observation lines just before the Impression line.
                      // setting the font size and the font family back to normal.
                      pdf.setFontSize(12); 
                      pdf.setFont("helvetica", "normal");
                      const totallines = observationArray.length;
                      const halflines = Math.ceil(totallines / 2);
                      console.log("This is the observation array :", observationArray);

                      // Adding the bullet point to the lines before printing them  on the pdf.
                      const addBulletPoint = (line) => {
                        if (line.startsWith(bullet)) {
                            return line;
                        }
                        return bullet + line;
                      };

                      // setting the left column and right column logic (left one is not needed, i can optimise it later.)
                      rightColumnY = currentYPosition;
                      leftColumnY = currentYPosition;

                      // Processing the texts which will fix the line text width greater than the column width issue.
                      const processTextColumn = (text, x, y, columnWidth) => {
                        let currentY = y;
                        const textWidth = pdf.getTextWidth(text);
                        const maxWidth = columnWidth - 20; // Padding for each column
                        console.log("This is the current y (at the beginning of processing the new line of array ) :", currentY);
                        console.log("This is the textWidth :", textWidth);
                        console.log("This is the maxwidth :", maxWidth);
                
                        if (textWidth > maxWidth) {
                          let remainingText = text;
                          pdf.setFont("helvetica", "normal");
                          let currentLine = '';
                      
                          // Split text into words
                          const words = remainingText.split(' ');
                      
                          for (const word of words) {
                              // Construct a test line with the next word
                              const testLine = currentLine.length > 0 ? currentLine + ' ' + word : word;
                              console.log("This is the testline :", testLine);
                              const testLineWidth = pdf.getTextWidth(testLine);
                      
                              if (testLineWidth > maxWidth) {
                                  // If it exceeds the width, print the current line
                                  if (currentLine.length > 0) {
                                      console.log("if the current line is greater than the maxwidth and is having some data:");
                                      console.log("This is the current line", currentLine);
                                      pdf.text(currentLine, x, currentY);
                                      currentY += 15; // Move down for the next line
                                      console.log("This is the current y :", currentY);
                                  }
                                  // Start a new line with the current word
                                  currentLine = "  " + word; // Reset current line to the word that caused overflow
                                  console.log("This is the remaining word or sentence added with a space here :", currentLine);
                                  
                              } else {
                                  // If it fits, update the current line
                                  currentLine = testLine;
                              }
                          }
                      
                          // Print any remaining text in currentLine
                          if (currentLine.length > 0) {
                              pdf.text(currentLine, x, currentY);
                              console.log("Printing any current line if left :", currentLine);
                              console.log("This is the current y updated on the remaining text code :", currentY);
                          }
                        } else {
                            pdf.text(text, x, currentY);
                            console.log("Adding the text directly because it doesn't need separation :", text);
                            console.log("the current y for directly added text:", currentY);
                        }

                        console.log("This is the current Y before just coming out of the process (return currenty +15) :", currentY);
                        
                        return currentY + 15;
                      
                      };

                      // Adding the lines to the respective side along with the bullet points. 
                      for (let i = 0; i < totallines; i++) {
                        const lineWithBullet = addBulletPoint(observationArray[i]);
                        console.log("These are the observation array lines given one by one :");
                        console.log(lineWithBullet);
                        console.log("End of the observation array separated lines.");
                        if (i < halflines) {
                            leftColumnY = processTextColumn(lineWithBullet, marginX, leftColumnY, columnWidth);
                        } else {
                            rightColumnY = processTextColumn(lineWithBullet, marginX + columnWidth + columnGap, rightColumnY, columnWidth);
                        }
                      }
                      currentYPosition = Math.max(leftColumnY, rightColumnY);
                      console.log("This is the right Column y :", rightColumnY);
                      console.log("This is the left column y :", leftColumnY);
                      console.log("This is the current y position :", currentYPosition);
                    } else {

                      // Adding the bullet point.
                      const addBulletPoint = (line) => {
                        if (line.startsWith(bullet)) {
                            return line;
                        }
                        return bullet + line;
                      };

                      // Now adding the texts in normal manner.
                      for (const line of observationArray){
                        const lineWithBullet = addBulletPoint(line);
                        pdf.text(lineWithBullet, marginX, currentYPosition);
                        currentYPosition += 15;
                      }

                    }
                    
                    // End of the observation text's logic.
                    currentYPosition += 20;
                    pdf.setFontSize(13);
                    pdf.setFont("helvetica", "bold");
                    pdf.text(paragraphText, marginX, currentYPosition);
                    pdf.setFontSize(10);
                    pdf.setFont("helvetica", "normal");
                    currentYPosition += 20;
                } else if (paragraphText.includes("Dr.")) {
                    currentYPosition = await this.addSignature(pdf, signatureUrl, currentYPosition);
                    pdf.setFontSize(12);
                    pdf.setFont("helvetica", "normal");
                    const drdatalines = paragraphText.split(',').map(line => line.trim()).filter(line => line.length > 0);
                    for (const drdata of drdatalines){
                      pdf.text(drdata, marginX, currentYPosition);
                      currentYPosition += 15;
                    }
                    currentYPosition += 10;
                } else if (paragraphText.includes("X-RAY")) {
                    pdf.setFontSize(13);
                    pdf.setFont("helvetica", "bold");
                    pdf.text(paragraphText, marginX, currentYPosition);
                    currentYPosition += 20;
                } else if (paragraphText.includes(bullet)) {
                    pdf.setFontSize(12);
                    pdf.setFont("helvetica", "bold");
                    const impressionlines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                    for (const line of impressionlines) {
                      pdf.text(line, marginX, currentYPosition);
                    }
                    currentYPosition += 20;
                } else {
                  // Handle text in columnar structure
                  const lines = paragraphText.split('.').map(line => line.trim()).filter(line => line.length > 0);
                  console.log("These are the lines of the observation :")
                  console.log(lines)
                  console.log("End of lines of the observation.")
                  // Adding the observation text in the array. 
                  for (const observationtext of lines){
                    observationArray.push(observationtext);
                  }
                  // End of the observation text logic.
                  
              }
            }              

            currentYPosition = await this.addReportImage(pdf, reportImageUrl, currentYPosition);

            const pdfBlob = pdf.output("blob");

            try {
                const csrfToken = await this.getCSRFToken();
                const formData = new FormData();
                formData.append("pdf", pdfBlob, filename ? filename + ".pdf" : "download.pdf");
                formData.append("patientId", patientId);
                formData.append("patientName", patientName);
                formData.append("age", age);
                formData.append("gender", gender);
                formData.append("testDate", testDate);
                formData.append("reportDate", reportDate);
                formData.append("location", location);
                formData.append("accession", accession);

                await axios.post("/upload_xray_pdf/", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-CSRFToken": csrfToken,
                    },
                });

                console.log("PDF successfully sent to Django backend.");
                this.showNotification("PDF successfully uploaded!");
            } catch (error) {
                console.error("Error sending PDF to Django backend.", error);
                this.showNotification("Error uploading PDF. Please try again.");
            }

            const currentURL = window.location.href;

            setTimeout(() => {
                window.location.href = document.referrer + "?nocache=" + Date.now();
            }, 200);

            window.addEventListener("popstate", () => {
                if (window.location.href !== currentURL) {
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 200);
                }
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            this.showNotification("Error generating PDF. Please try again.");
        } finally {
            this.hideLoader();
        }
    })();
}



  //////////////////// Upload XRAY PDF with IMAGE (END) /////////////////////////////////////////////

  ////////////////////////////////// Upload VITALS PDF without IMAGE (START) ////////////////////////
  UploadDivContentOnPDFVitals() {
    const showLoader = () => {
      console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    const extractDataFromURL = () => {
      const patientId = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
      )?.innerHTML;
      const patientName = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
      )?.innerHTML;
      const testDate = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(2) > span > strong"
      )?.innerHTML;
      const reportDate = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(3) > span > strong"
      )?.innerHTML;

      return { patientId, patientName, testDate, reportDate };
    };

    const showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
        notificationText.innerText = message;
        notification.style.display = "block";

        // Hide the notification after 3 seconds (adjust the delay as needed)
        setTimeout(() => {
          notification.style.display = "none";
        }, 1000);
      }
    };

    const getCSRFToken = async () => {
      try {
        const response = await fetch("/get-csrf-token/");
        const data = await response.json();
        return data.csrf_token;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        throw error;
      }
    };
    // Show the loader before starting the PDF generation
    showLoader();
    var filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (data != undefined) {
      var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
      var a4Height = 841.89; // A4 height in points

      var canvasWidth = a4Width - 40; // Adjusted width to leave some margin

      html2canvas(data, {
        scale: 4, // Adjust the scale if needed for better quality
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
      }).then(async (canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);

        // Calculate the height based on the aspect ratio of the captured image
        const canvasHeight = (canvasWidth / canvas.width) * canvas.height;

        // Hide the loader when the PDF is ready
        hideLoader();

        // Create PDF with only the captured content
        const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);
        pdf.addImage(imgData, "PNG", 20, 20, canvasWidth, canvasHeight);

        pdf.setTextColor(255, 255, 255);

        // Calculate the position to place the text at the bottom
        const textX = 40;
        const textY = 841.89 - 2; // 20 points from the bottom

        // If a table exists within the ck-editor__editable div, capture its text content
        if (table) {
          const tableText = table.textContent || "";

          // Add the table text as text (preserve original formatting)
          pdf.setFontSize(2); // Adjust the font size as needed
          pdf.text(textX, textY, tableText);
        }

        // Iterate through all paragraphs in the ck-editor__editable div
        const paragraphs = data.querySelectorAll("p");
        paragraphs.forEach((paragraph) => {
          const paragraphText = paragraph.textContent || "";

          // Add each paragraph text as text (preserve original formatting)
          pdf.setFontSize(2); // Adjust the font size as needed
          pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
        });

        // Convert the PDF to a Blob
        const pdfBlob = pdf.output("blob");

        // Extract data from URL
        const { patientId, patientName, testDate, reportDate } =
          extractDataFromURL();

        // Send the FormData to Django backend using fetch
        const csrfToken = await getCSRFToken();
        console.log("CSRF Token:", csrfToken);

        // Create FormData and append the PDF Blob
        const formData = new FormData();
        formData.append(
          "pdf",
          pdfBlob,
          filename ? filename + ".pdf" : "download.pdf"
        );
        formData.append("patientId", patientId);
        formData.append("patientName", patientName);
        formData.append("testDate", testDate);
        formData.append("reportDate", reportDate);

        console.log("FormData:", formData);

        try {
          const response = await axios.post("/upload_vitals_pdf/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRFToken": csrfToken,
            },
          });

          console.log(
            "PDF successfully sent to Django backend.",
            response.data
          );
          // Hide the loader when the PDF is ready
          hideLoader();
          // Show the success notification
          showNotification("PDF successfully uploaded!");
        } catch (error) {
          console.error("Error sending PDF to Django backend.", error);
          // Show the error notification
          showNotification("Error uploading PDF. Please try again.");
        }

        // Reload the current page after a short delay
        setTimeout(() => {
          window.location.reload(true);
        }, 200);
      });
    }
  }
  ////////////////////////////////// Upload Vitals PDF without IMAGE (END) ////////////////////////

  ////////////////////////////////// Upload OPtometry PDF without IMAGE (START) ////////////////////////
  UploadDivContentOnPDFOptometry() {
    const showLoader = () => {
      console.log("Showing loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "block";
      }
    };

    const hideLoader = () => {
      console.log("Hiding loader");
      const loader = document.querySelector(".loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    const extractDataFromURL = () => {
      const patientId = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(2) > span > strong"
      )?.innerHTML;
      const patientName = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(1) > td:nth-child(1) > span > strong"
      )?.innerHTML;
      const testDate = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(2) > span > strong"
      )?.innerHTML;
      const reportDate = document.querySelector(
        "#root > div > div > div.document-editor__editable-container > div > figure.table.ck-widget.ck-widget_with-selection-handle > table > tbody > tr:nth-child(2) > td:nth-child(3) > span > strong"
      )?.innerHTML;

      return { patientId, patientName, testDate, reportDate };
    };

    const showNotification = (message) => {
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");

      if (notification && notificationText) {
        notificationText.innerText = message;
        notification.style.display = "block";

        // Hide the notification after 3 seconds (adjust the delay as needed)
        setTimeout(() => {
          notification.style.display = "none";
        }, 1000);
      }
    };

    const getCSRFToken = async () => {
      try {
        const response = await fetch("/get-csrf-token/");
        const data = await response.json();
        return data.csrf_token;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        throw error;
      }
    };
    // Show the loader before starting the PDF generation
    showLoader();
    var filename = this.createFilename();
    const data = document.getElementsByClassName("ck-editor__editable")[0];
    const table = data.querySelector("table");
    data.classList.add("ck-blurred");
    data.classList.remove("ck-focused");
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (data != undefined) {
      var a4Width = 595.28; // A4 width in points (1 point = 1/72 inch)
      var a4Height = 841.89; // A4 height in points

      var canvasWidth = a4Width - 40; // Adjusted width to leave some margin

      html2canvas(data, {
        scale: 4, // Adjust the scale if needed for better quality
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
      }).then(async (canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);

        // Calculate the height based on the aspect ratio of the captured image
        const canvasHeight = (canvasWidth / canvas.width) * canvas.height;

        // Hide the loader when the PDF is ready
        hideLoader();

        // Create PDF with only the captured content
        const pdf = new jsPDF("p", "pt", [a4Width, a4Height], true);
        pdf.addImage(imgData, "PNG", 20, 20, canvasWidth, canvasHeight);

        pdf.setTextColor(255, 255, 255);

        // Calculate the position to place the text at the bottom
        const textX = 40;
        const textY = 841.89 - 2; // 20 points from the bottom

        // If a table exists within the ck-editor__editable div, capture its text content
        if (table) {
          const tableText = table.textContent || "";

          // Add the table text as text (preserve original formatting)
          pdf.setFontSize(2); // Adjust the font size as needed
          pdf.text(textX, textY, tableText);
        }

        // Iterate through all paragraphs in the ck-editor__editable div
        const paragraphs = data.querySelectorAll("p");
        paragraphs.forEach((paragraph) => {
          const paragraphText = paragraph.textContent || "";

          // Add each paragraph text as text (preserve original formatting)
          pdf.setFontSize(2); // Adjust the font size as needed
          pdf.text(textX, textY - 2, paragraphText); // Place it above the table text
        });

        // Convert the PDF to a Blob
        const pdfBlob = pdf.output("blob");

        // Extract data from URL
        const { patientId, patientName, testDate, reportDate } =
          extractDataFromURL();

        // Send the FormData to Django backend using fetch
        const csrfToken = await getCSRFToken();
        console.log("CSRF Token:", csrfToken);

        // Create FormData and append the PDF Blob
        const formData = new FormData();
        formData.append(
          "pdf",
          pdfBlob,
          filename ? filename + ".pdf" : "download.pdf"
        );
        formData.append("patientId", patientId);
        formData.append("patientName", patientName);
        formData.append("testDate", testDate);
        formData.append("reportDate", reportDate);

        console.log("FormData:", formData);

        try {
          const response = await axios.post(
            "/upload_optometry_pdf/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": csrfToken,
              },
            }
          );

          console.log(
            "PDF successfully sent to Django backend.",
            response.data
          );
          // Hide the loader when the PDF is ready
          hideLoader();
          // Show the success notification
          showNotification("PDF successfully uploaded!");
        } catch (error) {
          console.error("Error sending PDF to Django backend.", error);
          // Show the error notification
          showNotification("Error uploading PDF. Please try again.");
        }

        // Reload the current page after a short delay
        setTimeout(() => {
          window.location.reload(true);
        }, 200);
      });
    }
  }
  ////////////////////////////////// Upload Optometry PDF without IMAGE (END) ////////////////////////

  //////////////////////////////////////////////////////////////
  toDataURL(url, index, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(index, reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  }

  Export2Doc() {
    var filename = this.createFilename();
    console.log("printig word");
    const data = document.getElementsByClassName("ck-editor__editable")[0];

    var imgs = data.getElementsByTagName("img");
    console.log(...imgs);
    for (var i = 0; i < imgs.length; i++) {
      this.toDataURL(imgs[i].src, i, function (index, data) {
        console.log(imgs[index].src + "==>" + data);
        imgs[index].src = data;
      });
    }
    var element = data;
    console.log(data);
    //  _html_ will be replace with custom html
    var meta =
      "Mime-Version: 1.0\nContent-Base: " +
      location.href +
      '\nContent-Type: Multipart/related; boundary="NEXT.ITEM-BOUNDARY";type="text/html"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset="utf-8"\nContent-Location: ' +
      location.href +
      "\n\n<!DOCTYPE html>\n<html>\n_html_</html>";
    //  _styles_ will be replaced with custome css
    var head =
      '<head>\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n<style>\n_styles_\n</style>\n</head>\n';

    var html = data.innerHTML;

    var blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    var css =
      "<style>" +
      "img {width:300px;}table {border-collapse: collapse; border-spacing: 0;}td{padding: 6px;}" +
      "</style>";
    //  Image Area %%%%
    var options = { maxWidth: 624 };
    var images = Array();
    var img = data.getElementsByTagName("img");
    for (var i = 0; i < img.length; i++) {
      // Calculate dimensions of output image
      var w = Math.min(img[i].width, options.maxWidth);
      var h = img[i].height * (w / img[i].width);
      // Create canvas for converting image to data URL
      var canvas = document.createElement("CANVAS");
      canvas.width = w;
      canvas.height = h;
      // Draw image to canvas
      var context = canvas.getContext("2d");
      context.drawImage(img[i], 0, 0, w, h);
      // Get data URL encoding of image
      var uri = canvas.toDataURL("image/png");
      //$(img[i]).attr("src", img[i].src);
      img[i].src = img[i].src;
      img[i].width = w;
      img[i].height = h;
      // Save encoded image to array
      images[i] = {
        type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
        encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
        location: img[i].src, //$(img[i]).attr("src"),
        data: uri.substring(uri.indexOf(",") + 1),
      };
    }

    // Prepare bottom of mhtml file with image data
    var imgMetaData = "\n";
    for (var i = 0; i < images.length; i++) {
      imgMetaData += "--NEXT.ITEM-BOUNDARY\n";
      imgMetaData += "Content-Location: " + images[i].location + "\n";
      imgMetaData += "Content-Type: " + images[i].type + "\n";
      imgMetaData +=
        "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
      imgMetaData += images[i].data + "\n\n";
    }
    imgMetaData += "--NEXT.ITEM-BOUNDARY--";
    // end Image Area %%

    var output =
      meta.replace("_html_", head.replace("_styles_", css) + html) +
      imgMetaData;

    var url =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(output);

    filename = filename ? filename + ".doc" : "document.doc";

    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
    }

    document.body.removeChild(downloadLink);
  }

  GetDivContentOnWord() {
    var filename = this.createFilename();
    console.log("printig word");
    const data = document.getElementsByClassName("ck-editor__editable")[0];

    var imgs = data.getElementsByTagName("img");
    console.log(...imgs);
    for (var i = 0; i < imgs.length; i++) {
      this.toDataURL(imgs[i].src, i, function (index, data) {
        console.log(imgs[index].src + "==>" + data);
        imgs[index].src = data;
      });
    }
    console.log(data);

    var css =
      "<style>" +
      "@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}" +
      "div.WordSection1 {page: WordSection1;}" +
      "</style>";
    var preHTML =
      "<html xlmns:o='url:schemas-microsoft-com:office:office' xmlns:w='url:schemas-microsoft-com:office:word' xmlns='http://www.w3.org /TR/REC-html40'<head><meta charset='utf-8'><title>Word</title>" +
      css +
      "</head><body>";
    var postHTML = "</body></html>";
    var html = preHTML + data.innerHTML + postHTML;

    var blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    var url =
      "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(html);

    filename = filename ? filename + ".doc" : "document.doc";

    var link = document.createElement("a");
    document.body.appendChild(link);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      link.href = url;
      link.download = filename;
      link.click();
    }
    document.body.removeChild(link);
  }

  ActionEvents(evt) {
    let nindex = evt.target.selectedIndex;
    let label = evt.target[nindex].text;
    let value = evt.target.value;
    console.log("Selected Index:", nindex);
    console.log("Selected Label:", label);
    console.log("Selected Value:", value);
    switch (value) {
      case "1":
        console.log("pdf");
        this.GetDivContentOnPDFWithoutImage();
        break;
      case "2":
        console.log("pdf");
        this.GetDivContentOnPDF();
        break;
      case "3":
        console.log("pdf");
        this.GetEcgContentOnPDF();
        break;
      case "4":
        this.Export2Doc();
        break;
      case "5":
        this.printReport();
        break;
      case "6":
        this.uploadEcgPDF();
        break;
      case "7":
        console.log("Double page pdf uploaded");
        this.uploadXrayPDF();
        break;
      case "8":
        console.log("Single page pdf without image uploaded");
        this.UploadDivContentOnPDFWithoutImage();
        break;
      case "9":
        console.log("Single page pdf with image uploaded");
        this.UploadDivContentOnPDF();
        break;
      case "10":
        console.log("Vitals Report pdf");
        this.UploadDivContentOnPDFVitals();
        break;
      case "11":
        console.log("Optometry Report pdf");
        this.UploadDivContentOnPDFOptometry();
        break;
      case "12":
        console.log("JSON Report");
        this.GetDivContentAsJSON();
        break;
      default:
        console.log("---");
        break;
    }
    //document.getElementById("export_data").selectedIndex = 0;
    evt.target.selectedIndex = 0;
  }

  handleSeletion(evt) {
    let nindex = evt.target.selectedIndex;
    let label = evt.target[nindex].text;
    let value = evt.target.value;
    this.setState({
      options_label: label,
      reportFrmData: this.generatePatientTable(),
    });
    options.forEach(({ label, id }) => {
      if (value == id) {
        this.handleClick();
      }
    });
  }

  render() {
    const { options_label, reportFrmData } = this.state;
    return (
      <div>
        <div className="document-editor">
          <div className="document-editor__toolbar" />
          <div className="page-content">
            <div className="document-editor__editable-container">
              {this.state.modal && options_label === "X-RAY CHEST" ? (
                <XrayChest
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "CT PNS" ? (
                <PnsAbnormal
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "CAMP ECG" ? (
                <CampECG2
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal &&
                options_label === "X-RAY LEFT-SHOULDER" ? (
                <XrayLeftShoulder
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal &&
                options_label === "X-RAY RIGHT-SHOULDER" ? (
                <XrayRightShoulder
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "X-RAY KNEE" ? (
                <XrayKnee
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal &&
                options_label === "X-RAY SPINE(CERVICAL)" ? (
                <XraySpineCervical
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal &&
                options_label === "X-RAY SPINE(LUMBER)" ? (
                <XraySpineLumber
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal &&
                options_label === "X-RAY SPINE(DORSAL)" ? (
                <XraySpineDorsal
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                /> // this.state.modal && (options_label === "ECG") ?
              ) : //   <ECG handleClick={this.handleClick} reportFrmData={reportFrmData} generateReport={this.generateReport} generatePatientTable={this.generatePatientTable()} /> :
              this.state.modal && options_label === "VITALS" ? (
                <Vitals
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "OPTOMETRY" ? (
                <Optometry
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "OPTOMETRY NO-INPUT" ? (
                <Optometry2
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "OPTOMETRY (CAMP)" ? (
                <Optometry3
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "AUDIOMETRY" ? (
                <Audiometry
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal &&
                options_label === "OPTOMETRY (CAMP) NO-INPUT" ? (
                <Optometry4
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "CT ABDOMEN" ? (
                <CtAbdomen
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : this.state.modal && options_label === "CT HEAD" ? (
                <CtHead
                  handleClick={this.handleClick}
                  reportFrmData={reportFrmData}
                  generateReport={this.generateReport}
                  generatePatientTable={this.generatePatientTable()}
                />
              ) : (
                ""
              )}
              <CKEditor
                editor={DecoupledEditor}
                data={reportFrmData}
                onInit={(editor) => {
                  editor.onclick = this.onclickDiv;
                  window.editor = editor;
                  editor.allowedContent = true;
                  const toolbarContainer = document.querySelector(
                    ".document-editor__toolbar"
                  );

                  toolbarContainer.appendChild(editor.ui.view.toolbar.element);

                  window.editor.ui.view.toolbar.element.children[0].appendChild(
                    this.copyAction()
                  );
                  window.editor.ui.view.toolbar.element.children[0].appendChild(
                    this.choose()
                  );
                  // window.editor.ui.view.toolbar.element.children[0].appendChild(this.getPDFButton());
                  window.editor.ui.view.toolbar.element.children[0].appendChild(
                    this.actionDropDown()
                  );

                  window.editor.ui.view.toolbar.element.children[0].appendChild(
                    this.userDropdown()
                  );
                }}
              />
            </div>
            <div className="viewport-container">
              <div className="viewport" id="viewport"></div>
              <div className="button-container">
                <button
                  className="tool-button"
                  value="Zoom"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Zoom
                </button>
                <button
                  className="tool-button"
                  value="Contrast"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Contrast
                </button>
                <button
                  className="tool-button"
                  value="Rotate"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Rotate
                </button>
                <button
                  className="tool-button"
                  value="Invert"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Invert
                </button>
                <button
                  className="tool-button"
                  value="Pan"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Pan
                </button>
                <button
                  className="tool-button"
                  value="Length"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Length
                </button>
                <button
                  className="tool-button"
                  value="Magnify"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Magnify
                </button>
                <button
                  className="tool-button"
                  value="Markers"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Markers
                </button>
                <button
                  className="tool-button"
                  value="Disable"
                  onClick={(e) => this.enableTool(e.target.value)}
                >
                  Disable Tools
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
