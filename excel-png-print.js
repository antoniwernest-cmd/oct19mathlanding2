/* The first worksheet is a portrait contact sheet, two PNGs across and five down. */
window.ML_EXCEL_PNG_PRINT={
 create(book,title,count){
  const sheet=book.addWorksheet('PNG pages',{views:[{state:'frozen',ySplit:1,showGridLines:false}],pageSetup:{paperSize:1,orientation:'portrait',scale:100,fitToPage:false,horizontalCentered:true,printArea:'A1:C'+(1+2*Math.ceil(count/2)),printTitlesRow:'1:1',margins:{left:.25,right:.25,top:.25,bottom:.25,header:.1,footer:.1}}});
  sheet.columns=[{width:44},{width:1.3},{width:44}];sheet.mergeCells('A1:C1');sheet.getCell('A1').value=title;sheet.getCell('A1').font={name:'Nunito',size:12,bold:true,color:{argb:'FF183F45'}};sheet.getCell('A1').alignment={vertical:'middle'};sheet.getRow(1).height=22.5;
  sheet.headerFooter={oddFooter:'&L10 PNGs per portrait page&C&P / &N&RMath Landing'};
  for(let pair=0;pair<Math.ceil(count/2);pair++){const row=2+pair*2;sheet.getRow(row).height=18;sheet.getRow(row+1).height=127.5;if(pair>0&&pair%5===0)sheet.getRow(row-1).addPageBreak();}
  book.views=[{activeTab:0,firstSheet:0}];
  return {sheet,add(image,index,caption,detailSheet,detailRow,fill='FFF0F5EC',dimensions=null){
   const row=2+2*Math.floor(index/2),column=index%2===0?1:3,cell=sheet.getCell(row,column);
   cell.value={text:(index+1)+'. '+caption,hyperlink:"#'"+detailSheet.replaceAll("'","''")+"'!B"+detailRow};cell.font={name:'Nunito',size:8,bold:true,color:{argb:'FF183F45'}};cell.alignment={vertical:'middle',wrapText:true};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:fill}};
   const fit=dimensions?Math.min(300/dimensions.width,(300*768/1366)/dimensions.height):1,width=dimensions?dimensions.width*fit:300,height=dimensions?dimensions.height*fit:300*768/1366;
   sheet.addImage(image,{tl:{col:column-1+(dimensions?(313-width)/2:5)/313,row:row+(dimensions?(170-height)/2:1)/170},ext:{width,height},editAs:'oneCell'});
  }};
 }
};
