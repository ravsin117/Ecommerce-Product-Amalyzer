const puppeteer = require("puppeteer");
const fs= require("fs");;
const path= require("path");
const xlsx = require("xlsx");

let url = "https://www.flipkart.com/";
let browserstartpromise = puppeteer.launch({
  headless: false,
  defaultViewport: null,
  args: ["--start-maximized", "--disable-notifications"],
});

const wait = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};

let browser, page;
let dataArray = [];
let fulllinkArr=[];
let cwd =process.cwd();
let pathtillfolderArr=[];
(async function fn() {
  try {
    let browserobj = await browserstartpromise;
    browser = browserobj;
    let newpagepromise = await browser.newPage();
    page = newpagepromise;
    await page.goto(url);
    await page.waitForSelector("._2KpZ6l._2doB4z");
    await page.click("._2KpZ6l._2doB4z");
    await page.type("._3704LK", "Smartphones", { delay: 100 }); // typing smartphones
    await page.click(".L0Z3Pu"); //click search option
    await wait(3000);
    let somelist = await page.$$("._4rR01T");//list of all the product  
    console.log(somelist.length); // on a page it is 24 so its o/p is 24 
    let pricelist = await page.$$("._30jeq3._1_WHN1");
    let ratinglist = await page.$$("._3LWZlK");
    
    //making main directory for
    let mainDirpath= path.join(cwd,"Product details");
    // fs.mkdirSync(mainDirpath);
    await fs.promises.mkdir(mainDirpath);
    
    for (let i = 0; i < somelist.length; i++) {
      //value stores-> name of the headphones
      
      // value stores name of the product
      let value = await page.evaluate(function (element) {
        return element.textContent;
      }, somelist[i]);
      
      let prodNameArray = value.split(" ");
      let prodname = prodNameArray[0] + " ";
      prodname += prodNameArray[1];
      
      // nvalue stores--> price of the product
      let pvalue = await page.evaluate(function (element) {
        return element.textContent;
      }, pricelist[i]);

      //ratvalue---> rating of the product
      let ratvalue = await page.evaluate(function (element) {
        return element.textContent;
      }, ratinglist[i]);

      //making individual product folders
      let folderpath=path.join(mainDirpath, prodname);
      if (fs.existsSync(folderpath) == false) {
        await fs.promises.mkdir(folderpath);
      } else {        
        folderpath=path.join(mainDirpath, prodname + "-" + i);
        await fs.promises.mkdir(folderpath);
      }
      pathtillfolderArr.push(folderpath);
      // getting basic details about the product from search page
      dataArray.push({
        Product: value,
        Price: pvalue,
        Rating: ratvalue,
      });

      // let content=dataArray[i];
      // let pathf=folderpath[i]
      let jsoncontentfilePath = path.join(folderpath, "Basic_details.json");
      let jsonwriteable = JSON.stringify(dataArray[i]);
      await fs.promises.writeFile(jsoncontentfilePath, jsonwriteable);
      // console.log((i + 1) + ". " + value + " " + nvalue+"-----"+ratvalue);

      let anchorelementget = await page.$$("._1fQZEK");
      let individualProductlink = await page.evaluate(function (element) {
        return element.getAttribute("href");
      }, anchorelementget[i]);

      fulllinkArr.push(`http://flipkart.com${individualProductlink}`);
      // console.log(i+1,"---> ",fulllinkArr[i]);
    }
    
    
    for(let i = 0 ; i< somelist.length;i++){
      await getProdDetails(fulllinkArr[i], page,pathtillfolderArr[i]);
    }
    console.table(dataArray);
    
    
    // console.log(1);
  } catch (err) {
    console.log("Error: " + err);
  }
})();


async function getProdDetails(fullLink,cPage,pathtillfolder){
  let genDataArr = [];
  let displayDataArr = [];
  let osProcessorDataArr = [];
  let memoryDataArr = [];
  let cameraDataArr = [];
    try{
      await cPage.goto(fullLink);
      let boxes = page.$("._3k-BhJ");//--> 10 boxes
      let specsname = await page.$$(".flxcaE"); //-> 10 
      let col1 = await page.$$("._1hKmbr.col.col-3-12");//->74
      let col2 = await page.$$("._21lJbe");//-> 74
      
      //creating the file paths for indiviadual production files
      let generalfilepath= path.join(pathtillfolder,"General_Specification.xlsx")
      let displayfilepath= path.join(pathtillfolder,"Display_specification.xlsx")
      let osspecsfilepath = path.join(pathtillfolder, "OS_Specification.xlsx");
      let memoryspecsfilepath = path.join(pathtillfolder,"Memory_Specification.xlsx");
      let camspecsfilepath = path.join(pathtillfolder,"Camera_Specification.xlsx");
      console.log("Table for general data :");
      for(let i = 0 ; i <10;i++){
        //column 1 entries
        let column1 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col1[i]);

        // column 2 entries
        let column2 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col2[i]);

        genDataArr.push({
          column1: column1,
          column2: column2,
        });
        // let jsonwritabledata=JSON.stringify(genDataArr);
        // await fs.promises.writeFile(generalfilepath, jsonwritabledata);
      }
      await excelWriter(generalfilepath, genDataArr, "General Specification");
      console.table(genDataArr)
      
      //Display features
      console.log("Table for Dispaly features :");
      for (let i = 10; i < 16; i++) {
        //column 1 entries
        let column1 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col1[i]);

        // column 2 entries
        let column2 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col2[i]);

        displayDataArr.push({
          column1: column1,
          column2: column2,
        });
        // let jsonwritabledata = JSON.stringify(displayDataArr);
        // await fs.promises.writeFile(displayfilepath, jsonwritabledata);
        
      } 
      await excelWriter(displayfilepath, displayDataArr, "Dispaly features");
      console.table(displayDataArr);

      // os features
      console.log("Table for Os specifications:");
      for (let i = 16; i < 22; i++) {
        //column 1 entries
        let column1 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col1[i]);

        // column 2 entries
        let column2 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col2[i]);

        osProcessorDataArr.push({
          column1: column1,
          column2: column2,
        });
        // let jsonwriteabledata=JSON.stringify(osProcessorDataArr);
        // await fs.promises.writeFile(osspecsfilepath,jsonwriteabledata);
      }
      await excelWriter(osspecsfilepath,osProcessorDataArr,"Os Specification");
      console.table(osProcessorDataArr);

      //memory specifications
      console.log("Table for memory specifications :");
      for (let i = 22; i < 27; i++) {
        //column 1 entries
        let column1 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col1[i]);

        // column 2 entries
        let column2 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col2[i]);

        memoryDataArr.push({
          column1: column1,
          column2: column2,
        });
        // let jsonwritabledata = JSON.stringify(moemoryDataArr);
        // await fs.promises.writeFile(memoryspecsfilepath, jsonwritabledata);
      }
      await excelWriter(memoryspecsfilepath,memoryDataArr,"Memory Specifications");
      console.table(memoryDataArr);

      console.log("Table for Camera specifications :");
      for (let i = 27; i < 40; i++) {
        //column 1 entries
        let column1 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col1[i]);

        // column 2 entries
        let column2 = await cPage.evaluate(function (element) {
          return element.textContent;
        }, col2[i]);

        cameraDataArr.push({
          column1: column1,
          column2: column2,
        });
        // let jsonwriteabledata= JSON.stringify(cameraDataArr);
        // await fs.promises.writeFile(camspecsfilepath,jsonwriteabledata);
      }
      await excelWriter(camspecsfilepath,cameraDataArr,"Camera Specifications");
      console.table(cameraDataArr);

    }
    catch(error){
    console.log(error);
    }
}

async function excelWriter(filePath,json,sheetName){
  try{
    
    //workbook create
    let newWb = xlsx.utils.book_new();
    //worksheet create
    let newWs=xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWb,newWs,sheetName);
    //excel file create
    xlsx.writeFile(newWb,filePath);
  }
  catch(error){
    console.log(error);
  }
}



