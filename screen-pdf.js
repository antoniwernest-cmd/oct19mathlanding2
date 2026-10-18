// Preserve the indexed PNG pixel data in each PDF page without JPEG loss.
window.ML_SCREEN_PDF=class{
 constructor(){this.encoder=new TextEncoder();this.parts=[];this.offsets=[0];this.size=0;this.pages=[];this.add('%PDF-1.4\n');this.object(1,'<< /Type /Catalog /Pages 2 0 R >>')}
 add(value){const bytes=typeof value==='string'?this.encoder.encode(value):value;this.parts.push(bytes);this.size+=bytes.length}
 object(id,value){this.offsets[id]=this.size;this.add(id+' 0 obj\n');this.add(value);this.add('\nendobj\n')}
 async addPNG(uri){
  const raw=Uint8Array.from(atob(uri.split(',')[1]),c=>c.charCodeAt(0)),view=new DataView(raw.buffer),chunks=[];let width=0,height=0,palette=null,indexed=false;
  for(let at=8;at<raw.length;){const n=view.getUint32(at),kind=String.fromCharCode(...raw.subarray(at+4,at+8)),data=raw.subarray(at+8,at+8+n);if(kind==='IHDR'){width=view.getUint32(at+8);height=view.getUint32(at+12);indexed=data[8]===8&&data[9]===3}else if(kind==='PLTE')palette=data;else if(kind==='IDAT')chunks.push(data);at+=n+12}
  let bytes,settings;if(indexed&&palette){bytes=new Blob(chunks);settings='/Filter /FlateDecode /DecodeParms << /Predictor 15 /Colors 1 /BitsPerComponent 8 /Columns '+width+' >> /ColorSpace [/Indexed /DeviceRGB '+(palette.length/3-1)+' <'+Array.from(palette,b=>b.toString(16).padStart(2,'0')).join('')+'>]'}else{const image=await createImageBitmap(new Blob([raw],{type:'image/png'})),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0);image.close();bytes=await new Promise(r=>canvas.toBlob(r,'image/jpeg',.98));settings='/Filter /DCTDecode /ColorSpace /DeviceRGB'}
  const page=3+this.pages.length*3,img=page+1,content=page+2,w=1024.5,h=576;this.pages.push(page);this.object(page,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+w+' '+h+'] /Resources << /XObject << /Screen '+img+' 0 R >> >> /Contents '+content+' 0 R >>');
  this.offsets[img]=this.size;this.add(img+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+width+' /Height '+height+' /BitsPerComponent 8 '+settings+' /Length '+bytes.size+' >>\nstream\n');this.add(new Uint8Array(await bytes.arrayBuffer()));this.add('\nendstream\nendobj\n');
  const command='q\n'+w+' 0 0 '+h+' 0 0 cm\n/Screen Do\nQ\n';this.object(content,'<< /Length '+this.encoder.encode(command).length+' >>\nstream\n'+command+'endstream');
 }
 finish(){this.object(2,'<< /Type /Pages /Kids ['+this.pages.map(n=>n+' 0 R').join(' ')+'] /Count '+this.pages.length+' >>');const start=this.size,count=3+this.pages.length*3;this.add('xref\n0 '+count+'\n0000000000 65535 f \n');for(let i=1;i<count;i++)this.add(String(this.offsets[i]).padStart(10,'0')+' 00000 n \n');this.add('trailer\n<< /Size '+count+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n');return new Blob(this.parts,{type:'application/pdf'})}
};
