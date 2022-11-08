const express = require("express"); //express모듈가져와서 사용하겠습니다.
const axios = require("axios");
const cheerio = require("cheerio");
const { response } = require("express");
const app = express();
var url = require("url");


async function getSkill(id) {
  return await axios.get("https://lostark.game.onstove.com/Profile/Character/" + id).then((response) => {
    let skillList = []; //스킬JSON
    const $ = cheerio.load(response.data);
    const $skillList = $("div.profile-skill__list").children('div.profile-skill__item'); //전투스킬 목록

    $skillList.each(function(i, elem) {//json으로
      var skillInfoJson = JSON.parse($(this).children("a.button").attr("data-skill")); //스킬정보 String to json
      var selectTripordArray = skillInfoJson.selectedTripodTier; //선택 트라이포드 티어별 목록 예시)[3,2,1]형태로 들어가 있으며 1티어,2티어,3티어
      var allTripordArray = skillInfoJson.tripodList;

      //스킬
      var skillType = skillInfoJson.type.substring(skillInfoJson.type.indexOf("'>") + 2, skillInfoJson.type.indexOf("</FONT>"));
      
      //룬
      var runeName = "";
      var runeGrade = "";
      var runInfoJson;
      if(skillInfoJson.hasOwnProperty("rune")) {
        var startIndex; //자르기 시작점
        var endIndex; //자르기 끝나는지점

        runInfoJson = JSON.parse(skillInfoJson.rune.tooltip); //스킬정보 안에 룬 정보 String to json

        //룬이름
        startIndex = runInfoJson.Element_000.value.indexOf("</FONT>") - 2;
        endIndex = runInfoJson.Element_000.value.indexOf("</FONT>");
        runeName = runInfoJson.Element_000.value.substring(startIndex, endIndex);
        
        //룬등급
        startIndex = runInfoJson.Element_001.value.leftStr0.indexOf("</FONT></FONT>") - 7;
        endIndex = runInfoJson.Element_001.value.leftStr0.indexOf("</FONT></FONT>");
        runeGrade = runInfoJson.Element_001.value.leftStr0.substring(startIndex, endIndex);
      }

      //트라이포드
      var oneTierTripord = ""; //1티어 선택 트라이포드
      var oneTierTripordLev = ""; //1티어 선택 트라이포드 레벨

      var twoTierTripord = ""; //2티어 선택 트라이포드
      var twoTierTripordLev = ""; //2티어 선택 트라이포드 레벨

      var threeTierTripord = ""; //3티어 선택 트라이포드
      var threeTierTripordLev = ""; //3티어 선택 트라이포드 레벨

      for(var r = 0; r<allTripordArray.length; r++) {
        var startIndex; //자르기 시작점
        var endIndex; //자르기 끝나는지점

        if(allTripordArray[r].level == 0 && allTripordArray[r].slot == selectTripordArray[0]) { //1티어는 level이 0이며, slot순서가 선택된 트라이포드 찾기
          startIndex = allTripordArray[r].name.indexOf('\'>');
          endIndex = allTripordArray[r].name.indexOf('</font>');
          oneTierTripord = allTripordArray[r].name.substring(startIndex + 2, endIndex);
          oneTierTripordLev = allTripordArray[r].featureLevel;
        } else if(allTripordArray[r].level == 1 && allTripordArray[r].slot == selectTripordArray[1]) { //2티어는 level이 0이며, slot순서가 선택된 트라이포드 찾기
          startIndex = allTripordArray[r].name.indexOf('\'>');
          endIndex = allTripordArray[r].name.indexOf('</font>');
          twoTierTripord = allTripordArray[r].name.substring(startIndex + 2, endIndex);
          twoTierTripordLev = allTripordArray[r].featureLevel;
        } else if(allTripordArray[r].level == 2 && allTripordArray[r].slot == selectTripordArray[2]) { //3티어는 level이 0이며, slot순서가 선택된 트라이포드 찾기
          startIndex = allTripordArray[r].name.indexOf('\'>');
          endIndex = allTripordArray[r].name.indexOf('</font>');
          threeTierTripord = allTripordArray[r].name.substring(startIndex + 2, endIndex);
          threeTierTripordLev = allTripordArray[r].featureLevel;
          break;
        }
      }

      skillList[i] = {
        skillName: skillInfoJson.name, //스킬이름
        skillType: skillType, //스킬종류
        skillLevel: skillInfoJson.level, //스킬레벨
        oneTierTripord : oneTierTripord, //1트포
        oneTierTripordLev : oneTierTripordLev, //1트포레벨
        twoTierTripord : twoTierTripord, //2트포
        twoTierTripordLev : twoTierTripordLev, //2트포레벨
        threeTierTripord : threeTierTripord, //3트포
        threeTierTripordLev : threeTierTripordLev, //3트포레벨
        runeName: runeName, //장착 룬 이름
        runeGrade : runeGrade, //장착 룬 등급
      };
    });

    return skillList;
  })
}

async function getJewel(id) {
  return await axios.get("https://lostark.game.onstove.com/Profile/Character/" + id).then((response) => {
    let jewelList = [];

    let jewelSlotList = [];
    let jewelEffectlList = [];
    const $ = cheerio.load(response.data);
    const $jewelSlotList = $("div.jewel-effect__wrap").children('div.jewel__wrap').children('span.jewel_btn'); //보석 목록(보석칸)
    const $jewelEffectlList = $("div.jewel-effect__list").children("div.box_wrapper").children("ul").children("li"); //보석 효과 목록

    $jewelSlotList.each(function(i, elem) {//json으로
      jewelSlotList[i] = {
        id : $(this).attr("id"), //보석ID
        jewelLevel : $(this).children("span.jewel_level").text(), //보석레벨
      };
    });

    $jewelEffectlList.each(function(i, elem) {//json으로
      jewelEffectlList[i] = {
        id : $(this).children("span.slot").attr("data-gemkey"), //보석스킬ID
        skillName : $(this).children("strong.skill_tit").text(), //보석적용 스킬이름
        effectName : $(this).children("p.skill_detail").text()
      };
    });

    var q=0;
    for(var x=0; x<jewelSlotList.length; x++) {
      for(var y=0; y<jeweEffectlList.length; y++) {
        if(jewelSlotList[x].id == jeweEffectlList[y].id) {
          jewelList[q] = {
            id : jeweEffectlList[y].id,
            skillName : jeweEffectlList[y].skillName,
            jewelEffect : jeweEffectlList[y].effectName.replace(jeweEffectlList[y].skillName + " ", ""),
            jewelLev : jewelSlotList[x].jewelLevel
          }
          q++;
          break;
        }
      }
    }

    return jeweList;
  })
}

app.set("view engine", "ejs"); 

app.get("/skill", (req, res) => {
  var _url = req.url;
  var data = url.parse(_url, true).query;
  console.log(data.id);
  getSkill(data.id).then(skillList => {
    res.send(skillList);
    //res.render("main", skill);
  })
})

app.get("/jewel", (req, res) => {
  var _url = req.url;
  var data = url.parse(_url, true).query;
  console.log(data.id);
  getJewel(data.id).then(skillList => {
    res.send(skillList);
    //res.render("main", skill);
  })
})

app.listen(3000);