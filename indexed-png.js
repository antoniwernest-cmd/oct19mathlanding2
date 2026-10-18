// Compact, full-resolution PNGs keep a complete tablet workbook manageable.
window.ML_INDEXED_PNG=async canvas=>{
 if(!window.CompressionStream)return canvas.toDataURL('image/png');
 const w=canvas.width,h=canvas.height,rgba=canvas.getContext('2d').getImageData(0,0,w,h).data;
 const count=new Uint32Array(32768),red=new Uint32Array(32768),green=new Uint32Array(32768),blue=new Uint32Array(32768);
 for(let i=0;i<rgba.length;i+=4){const key=((rgba[i]>>3)<<10)|((rgba[i+1]>>3)<<5)|(rgba[i+2]>>3);count[key]++;red[key]+=rgba[i];green[key]+=rgba[i+1];blue[key]+=rgba[i+2]}
 const keys=[];for(let k=0;k<count.length;k++)if(count[k])keys.push(k);keys.sort((a,b)=>count[b]-count[a]);const top=keys.slice(0,256),lookup=new Int16Array(32768);lookup.fill(-1);const palette=new Uint8Array(top.length*3);
 top.forEach((key,i)=>{lookup[key]=i;palette[i*3]=Math.round(red[key]/count[key]);palette[i*3+1]=Math.round(green[key]/count[key]);palette[i*3+2]=Math.round(blue[key]/count[key])});
 for(const key of keys){if(lookup[key]>=0)continue;const r=red[key]/count[key],g=green[key]/count[key],b=blue[key]/count[key];let best=0,distance=Infinity;for(let i=0;i<top.length;i++){const d=(r-palette[i*3])**2+(g-palette[i*3+1])**2+(b-palette[i*3+2])**2;if(d<distance){distance=d;best=i}}lookup[key]=best}
 const rows=new Uint8Array((w+1)*h);for(let y=0;y<h;y++){const offset=y*(w+1);for(let x=0;x<w;x++){const i=(y*w+x)*4,key=((rgba[i]>>3)<<10)|((rgba[i+1]>>3)<<5)|(rgba[i+2]>>3);rows[offset+x+1]=lookup[key]}}
 const stream=new Blob([rows]).stream().pipeThrough(new CompressionStream('deflate')),compressed=new Uint8Array(await new Response(stream).arrayBuffer());
 const table=window.ML_PNG_CRC||(window.ML_PNG_CRC=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0}));
 const chunk=(name,data)=>{const bytes=new Uint8Array(data.length+12),view=new DataView(bytes.buffer);view.setUint32(0,data.length);for(let i=0;i<4;i++)bytes[4+i]=name.charCodeAt(i);bytes.set(data,8);let crc=0xffffffff;for(let i=4;i<bytes.length-4;i++)crc=table[(crc^bytes[i])&255]^(crc>>>8);view.setUint32(bytes.length-4,(crc^0xffffffff)>>>0);return bytes};
 const header=new Uint8Array(13),view=new DataView(header.buffer);view.setUint32(0,w);view.setUint32(4,h);header[8]=8;header[9]=3;
 const blob=new Blob([new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('PLTE',palette),chunk('IDAT',compressed),chunk('IEND',new Uint8Array())],{type:'image/png'});
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not encode this page.'));reader.readAsDataURL(blob)});
};
