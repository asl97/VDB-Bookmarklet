Click and drag to bookmark to 'install'.

[e621.js](javascript:%28function%28%29%7B%22use%20strict%22%3Blet%20_scope%3Dfunction%28scope%29%7Bthis.dependencies%3D%5B%5D%3Bthis.scope%3Dscope%3Bthis.load%3Dfunction%28url%29%7Blet%20script%3Ddocument.createElement%28%22script%22%29%3Bscript.src%3Durl%3Blet%20p%3Dnew%20Promise%28%28resolve%2Creject%29%3D%3E%7Bscript.onload%3Dresolve%3Bscript.onerror%3Dfunction%28%29%7Breject%28url%29%7D%7D%29%3Bscope.appendChild%28script%29%3Bthis.dependencies.push%28p%29%7D%3Bthis.run%3Dasync%20function%28func%29%7Bawait%20Promise.all%28this.dependencies%29.catch%28function%28error%29%7Blet%20emsg%3D%60Dependency%20%27%24%7Berror%7D%27%20failed%20to%20load%60%3Balert%28emsg%29%3Bthrow%20emsg%7D%29%3Blet%20script%3Ddocument.createElement%28%22script%22%29%3Bscript.text%3D%60%28%24%7Bfunc.toString%28%29%7D%29%28%29%60%3Bscope.appendChild%28script%29%7D%7D%3Blet%20local_scope%3Dasync%20function%28%29%7Blet%20scope%3Dnew%20_scope%28document.body%29%3Breturn%20scope%7D%3Blet%20iframe_scope%3Dasync%20function%28%29%7Blet%20iframe%3Ddocument.createElement%28%22iframe%22%29%3Biframe.style.display%3D%22none%22%3Blet%20loaded%3Dnew%20Promise%28%28resolve%2Creject%29%3D%3E%7Biframe.onload%3Dresolve%7D%29%3Bdocument.body.appendChild%28iframe%29%3Bawait%20loaded%3Blet%20scope%3Dnew%20_scope%28iframe.contentDocument.body%29%3Breturn%20scope%7D%3Blet%20bookmarklet%3Dasync%20function%28dependencies%2Cfunc%2Cscope%3Diframe_scope%29%7Blet%20iframe%3Dawait%20scope%28%29%3Bfor%28let%20dependency%20of%20dependencies%29%7Biframe.load%28dependency%29%7Diframe.run%28func%29%3Breturn%20iframe%7D%3Bbookmarklet%28%5B%22https%3A//stuk.github.io/jszip/dist/jszip.js%22%2C%22https%3A//stuk.github.io/jszip-utils/dist/jszip-utils.js%22%2C%22https%3A//stuk.github.io/jszip/vendor/FileSaver.js%22%5D%2Cfunction%28%29%7Bfunction%20urlToPromise%28url%29%7Breturn%20new%20Promise%28function%28resolve%2Creject%29%7BJSZipUtils.getBinaryContent%28url%2Cfunction%28err%2Cdata%29%7Bif%28err%29%7Breject%28err%29%7Delse%7Bresolve%28data%29%7D%7D%29%7D%29%7Dlet%20proxy%3D%22https%3A//cors-anywhere.herokuapp.com/%22%3Blet%20id%3Dwindow.location.href.split%28%22/%22%29.pop%28%29%3Blet%20links%3D%5B%5D%3Basync%20function%20get_page%28page%29%7Blet%20r%3Dawait%20fetch%28%60https%3A//e621.net/pool/show.json%3Fid%3D%24%7Bid%7D%26page%3D%24%7Bpage%7D%60%29%3Blet%20json%3Dawait%20r.json%28%29%3Breturn%20json%7Dfunction%20process_page%28json%29%7Bfor%28post%20of%20json.posts%29%7Blet%20filename%3Dpost%5B%22file_url%22%5D.split%28%22/%22%29.pop%28%29%3Blinks.push%28%5Bfilename%2Cproxy%2Bpost%5B%22file_url%22%5D%5D%29%3Bif%28post%5B%22has_notes%22%5D%29%7Blinks.push%28%5Bfilename%2B%22.xml%22%2C%60https%3A//e621.net/note/index.xml%3Fpost_id%3D%24%7Bpost%5B%22id%22%5D%7D%60%5D%29%7D%7D%7Dasync%20function%20urlWithNameToPromise%28filename%2Curl%29%7Breturn%5Bfilename%2Cawait%20urlToPromise%28url%29%5D%7Dasync%20function%20process_urls%28urls%2Climit%3D4%29%7Blet%20executing%3D%5B%5D%3Blet%20promises%3D%5B%5D%3Bfor%28let%5Bfilename%2Curl%5Dof%20urls%29%7Bif%28executing.length%3E%3Dlimit%29%7Bawait%20Promise.race%28executing%29%7Dlet%20promise%3DurlWithNameToPromise%28filename%2Curl%29%3Bexecuting.push%28promise%29%3Bpromises.push%28promise%29%3Bpromise.then%28%28%29%3D%3E%7Bexecuting.splice%28executing.indexOf%28promise%29%2C1%29%7D%29%7Dreturn%20Promise.all%28promises%29%7Dasync%20function%20download_images%28archive_name%29%7Bvar%20zip%3Dnew%20JSZip%3Blet%20datas%3Dawait%20process_urls%28links%29%3Bfor%28let%5Bfilename%2Cdata%5Dof%20datas%29%7Bzip.file%28filename%2Cdata%2C%7Bbinary%3Atrue%7D%29%7Dzip.generateAsync%28%7Btype%3A%22blob%22%7D%2Cfunction%20updateCallback%28metadata%29%7Bvar%20msg%3D%22progression%20%3A%20%22%2Bmetadata.percent.toFixed%282%29%2B%22%20%25%22%3Bconsole.log%28msg%29%7D%29.then%28function%20callback%28blob%29%7BsaveAs%28blob%2Carchive_name%29%3Bconsole.log%28%22done%20%21%22%29%7D%2Cfunction%28e%29%7Balert%28e%29%7D%29%7Dasync%20function%20start%28%29%7Blet%20first_page%3Dawait%20get_page%281%29%3Bprocess_page%28first_page%29%3Blet%20total_count%3Dfirst_page.post_count%3Blet%20count%3Dfirst_page.posts.length%3Blet%20page_num%3D2%3Bwhile%28count%3Ctotal_count%29%7Blet%20json%3Dawait%20get_page%28page_num%29%3Bprocess_page%28json%29%3Bcount%2B%3Djson.posts.length%3Bpage_num%2B%3D1%7Ddownload_images%28%60%24%7Bfirst_page.name%7D-%24%7Bid%7D.zip%60%29%7Dstart%28%29%7D%2Clocal_scope%29%7D%29%28%29%3B%0A)

[mangadex.menu.js](javascript:%28function%28%29%7B%22use%20strict%22%3Blet%20_scope%3Dfunction%28scope%29%7Bthis.dependencies%3D%5B%5D%3Bthis.scope%3Dscope%3Bthis.load%3Dfunction%28url%29%7Blet%20script%3Ddocument.createElement%28%22script%22%29%3Bscript.src%3Durl%3Blet%20p%3Dnew%20Promise%28%28resolve%2Creject%29%3D%3E%7Bscript.onload%3Dresolve%3Bscript.onerror%3Dfunction%28%29%7Breject%28url%29%7D%7D%29%3Bscope.appendChild%28script%29%3Bthis.dependencies.push%28p%29%7D%3Bthis.run%3Dasync%20function%28func%29%7Bawait%20Promise.all%28this.dependencies%29.catch%28function%28error%29%7Blet%20emsg%3D%60Dependency%20%27%24%7Berror%7D%27%20failed%20to%20load%60%3Balert%28emsg%29%3Bthrow%20emsg%7D%29%3Blet%20script%3Ddocument.createElement%28%22script%22%29%3Bscript.text%3D%60%28%24%7Bfunc.toString%28%29%7D%29%28%29%60%3Bscope.appendChild%28script%29%7D%7D%3Blet%20local_scope%3Dasync%20function%28%29%7Blet%20scope%3Dnew%20_scope%28document.body%29%3Breturn%20scope%7D%3Blet%20iframe_scope%3Dasync%20function%28%29%7Blet%20iframe%3Ddocument.createElement%28%22iframe%22%29%3Biframe.style.display%3D%22none%22%3Blet%20loaded%3Dnew%20Promise%28%28resolve%2Creject%29%3D%3E%7Biframe.onload%3Dresolve%7D%29%3Bdocument.body.appendChild%28iframe%29%3Bawait%20loaded%3Blet%20scope%3Dnew%20_scope%28iframe.contentDocument.body%29%3Breturn%20scope%7D%3Blet%20bookmarklet%3Dasync%20function%28dependencies%2Cfunc%2Cscope%3Diframe_scope%29%7Blet%20iframe%3Dawait%20scope%28%29%3Bfor%28let%20dependency%20of%20dependencies%29%7Biframe.load%28dependency%29%7Diframe.run%28func%29%3Breturn%20iframe%7D%3Bbookmarklet%28%5B%22https%3A//stuk.github.io/jszip/dist/jszip.js%22%2C%22https%3A//stuk.github.io/jszip-utils/dist/jszip-utils.js%22%2C%22https%3A//stuk.github.io/jszip/vendor/FileSaver.js%22%5D%2Cfunction%28%29%7Bvar%20Promise%3Dwindow.Promise%3Bif%28%21Promise%29%7BPromise%3DJSZip.external.Promise%7Dfunction%20urlToPromise%28url%29%7Breturn%20new%20Promise%28function%28resolve%2Creject%29%7BJSZipUtils.getBinaryContent%28url%2Cfunction%28err%2Cdata%29%7Bif%28err%29%7Breject%28err%29%7Delse%7Bresolve%28data%29%7D%7D%29%7D%29%7Dvar%20chapters%2Clangs%2Ccheckboxes%2Cchapter_content%2Cbg_div%3Blangs%3D%7B%7D%3Bchapters%3D%7B%7D%3Bcheckboxes%3D%7B%7D%3Bvar%20code_to_lang%3D%7Bgb%3A%22English%22%2Cbr%3A%22Portuguese%20%28Br%29%22%7D%3Bfunction%20close_dl_menu%28%29%7Bdocument.body.removeChild%28bg_div%29%7Dasync%20function%20urlWithNameToPromise%28filename%2Curl%29%7Breturn%5Bfilename%2Cawait%20urlToPromise%28url%29%5D%7Dasync%20function%20process_urls%28urls%2Climit%3D4%29%7Blet%20executing%3D%5B%5D%3Blet%20promises%3D%5B%5D%3Bfor%28let%5Bfilename%2Curl%5Dof%20urls%29%7Bif%28executing.length%3E%3Dlimit%29%7Bawait%20Promise.race%28executing%29%7Dlet%20promise%3DurlWithNameToPromise%28filename%2Curl%29%3Bexecuting.push%28promise%29%3Bpromises.push%28promise%29%3Bpromise.then%28%28%29%3D%3E%7Bexecuting.splice%28executing.indexOf%28promise%29%2C1%29%7D%29%7Dreturn%20Promise.all%28promises%29%7Dasync%20function%20download_images%28chapter_obj%29%7Bvar%20zip%3Dnew%20JSZip%3Blet%20r%3Dawait%20fetch%28%60https%3A//mangadex.org/api/%3Fid%3D%24%7Bchapter_obj.chapter_id%7D%26type%3Dchapter%60%29%3Blet%20json%3Dawait%20r.json%28%29%3Blet%20links%3D%5B%5D%3Bfor%28img%20of%20json.page_array%29%7Blinks.push%28%5Bimg%2C%60%24%7Bjson.server%7D%24%7Bjson.hash%7D/%24%7Bimg%7D%60%5D%29%7Dlet%20datas%3Dawait%20process_urls%28links%29%3Bfor%28let%5Bfilename%2Cdata%5Dof%20datas%29%7Bzip.file%28filename%2Cdata%2C%7Bbinary%3Atrue%7D%29%7Dzip.generateAsync%28%7Btype%3A%22blob%22%7D%2Cfunction%20updateCallback%28metadata%29%7Bvar%20msg%3D%22progression%20%3A%20%22%2Bmetadata.percent.toFixed%282%29%2B%22%20%25%22%3Bconsole.log%28msg%29%7D%29.then%28function%20callback%28blob%29%7Bfilename%3Dchapter_obj.manga_title%2B%60%20-%20c.%24%7Bjson.chapter.padStart%282%2C0%29%7D.zip%60%3BsaveAs%28blob%2Cfilename%29%3Bconsole.log%28%22done%20%21%22%29%7D%2Cfunction%28e%29%7Balert%28e%29%7D%29%7Dasync%20function%20process_dl_tasks%28dl_list%29%7Bfor%28let%20chapter_obj%20of%20dl_list%29%7Bawait%20download_images%28chapter_obj%29%7D%7Dfunction%20process_dl%28%29%7Bvar%20dl_list%3D%5B%5D%3Bfor%28let%5Bchapter_id%2Ccheckbox%5Dof%20Object.entries%28checkboxes%29%29%7Bif%28checkbox.checked%29%7Bdl_list.push%28chapters%5Bchapter_id%5D%29%7D%7Ddl_list.sort%28%28a%2Cb%29%3D%3Ea.chapter-b.chapter%29%3Bprocess_dl_tasks%28dl_list%29%7Dfunction%20el_checkbox%28chapter_obj%29%7Bvar%20div%2Ctitle%2Clang%2Ccheckbox%2Clang_code%2Cname%2Cgroup_name%3Bname%3D%60Vol.%20%24%7Bchapter_obj.volume%7D%20Ch.%20%24%7Bchapter_obj.chapter%7D%60%3Bif%28chapter_obj.title%29%7Bname%2B%3D%60%20-%20%24%7Bchapter_obj.title%7D%60%7Dchapter_obj.name%3Dname%3Blang_code%3Dchapter_obj.lang_code%3Blangs%5Blang_code%5D%3Dtrue%3Bdiv%3Ddocument.createElement%28%22div%22%29%3Bdiv.dataset.lang_code%3Dlang_code%3Bdiv.style.display%3D%22table-row%22%3Btitle%3Ddocument.createElement%28%22span%22%29%3Btitle.textContent%3Dname%3Bdiv.appendChild%28title%29%3Btitle.style.display%3D%22table-cell%22%3Bgroup_name%3Ddocument.createElement%28%22span%22%29%3Bgroup_name.textContent%3Dchapter_obj.group_name%3Bdiv.appendChild%28group_name%29%3Bgroup_name.style.display%3D%22table-cell%22%3Blang%3Ddocument.createElement%28%22span%22%29%3Blang.textContent%3Dcode_to_lang%5Blang_code%5D%7C%7Clang_code%3Blang.style.display%3D%22table-cell%22%3Bdiv.appendChild%28lang%29%3Bcheckbox%3Ddocument.createElement%28%22input%22%29%3Bcheckbox.type%3D%22checkbox%22%3Bcheckbox.style.display%3D%22table-cell%22%3Bcheckboxes%5Bchapter_obj.chapter_id%5D%3Dcheckbox%3Bdiv.appendChild%28checkbox%29%3Btitle.onclick%3Dfunction%28%29%7Bcheckbox.click%28%29%7D%3Blang.onclick%3Dfunction%28%29%7Bcheckbox.click%28%29%7D%3Breturn%20div%7Dfunction%20filter%28lang_code%29%7Bfor%28el%20of%20chapter_content.children%29%7Bif%28lang_code%3D%3D%22All%22%7C%7Clang_code%3D%3Del.dataset.lang_code%29%7Bel.style.display%3D%22table-row%22%7Delse%7Bel.style.display%3D%22None%22%7D%7D%7Dbg_div%3Ddocument.createElement%28%22div%22%29%3Bbg_div.style.position%3D%22fixed%22%3Bbg_div.style%5B%22z-index%22%5D%3D%221%22%3Bbg_div.style.left%3D%220%22%3Bbg_div.style.top%3D%220%22%3Bbg_div.style.width%3D%22100%25%22%3Bbg_div.style.height%3D%22100%25%22%3Bbg_div.style.overflow%3D%22auto%22%3Bbg_div.style%5B%22background-color%22%5D%3D%22rgba%280%2C0%2C0%2C%200.4%29%22%3Bif%28%21bg_div.style%5B%22background-color%22%5D%29%7Bbg_div.style%5B%22background-color%22%5D%3D%22rgb%280%2C0%2C0%29%22%7Dbg_div.onclick%3Dclose_dl_menu%3Bchapter_content%3Ddocument.createElement%28%22div%22%29%3Bchapter_content.style.display%3D%22table%22%3Bchapter_content.style%5B%22white-space%22%5D%3D%22nowrap%22%3Bchapter_content.style.padding%3D%2220px%22%3Bclose_button_row%3Ddocument.createElement%28%22div%22%29%3Bclose_button%3Ddocument.createElement%28%22span%22%29%3Bclose_button.style.float%3D%22right%22%3Bclose_button.innerHTML%3D%22Close%20%26times%22%3Bclose_button.onclick%3Dclose_dl_menu%3Bclose_button_row.appendChild%28close_button%29%3Bcontent_wrapper%3Ddocument.createElement%28%22div%22%29%3Bcontent_wrapper.style.display%3D%22table%22%3Bcontent_wrapper.style%5B%22background-color%22%5D%3D%22%23ffffff%22%3Bcontent_wrapper.style.margin%3D%225%25%20auto%22%3Bcontent_wrapper.style.padding%3D%2220px%22%3Bcontent_wrapper.style.border%3D%221px%20solid%20%23888%22%3Bcontent_wrapper.onclick%3Dfunction%28e%29%7Be.stopPropagation%28%29%7D%3Bdl_button%3Ddocument.createElement%28%22button%22%29%3Bdl_button.textContent%3D%22Download%22%3Bdl_button.style.float%3D%22right%22%3Bdl_button.onclick%3Dprocess_dl%3Bcontent_wrapper.appendChild%28close_button_row%29%3Bcontent_wrapper.appendChild%28chapter_content%29%3Bcontent_wrapper.appendChild%28dl_button%29%3Bbg_div.appendChild%28content_wrapper%29%3Bdocument.body.appendChild%28bg_div%29%3Bfetch%28%60https%3A//mangadex.org/api/%3Fid%3D%24%7Blocation.href.split%28%22/%22%29%5B4%5D%7D%26type%3Dmanga%60%29.then%28r%3D%3E%7Br.json%28%29.then%28json%3D%3E%7Bfor%28let%5Bchapter_id%2Cchapter_obj%5Dof%20Object.entries%28json.chapter%29%29%7Bchapter_obj.manga_title%3Djson.manga.title%3Bchapter_obj.chapter_id%3Dchapter_id%3Bchapters%5Bchapter_id%5D%3Dchapter_obj%3Bel%3Del_checkbox%28chapter_obj%29%3Bchapter_content.appendChild%28el%29%7Dlet%20ls%3DObject.keys%28langs%29.sort%28%29%3Bls.unshift%28%22All%22%29%3Bfor%28let%20lang%20of%20ls%29%7Blet%20button%3Ddocument.createElement%28%22button%22%29%3Bbutton.textContent%3Dcode_to_lang%5Blang%5D%7C%7Clang%3Bbutton.onclick%3D%28%28%29%3D%3Efilter%28lang%29%29%3Bclose_button_row.insertBefore%28button%2Cclose_button%29%7D%7D%29%7D%29%7D%2Clocal_scope%29%7D%29%28%29%3B%0A)

[pixiv.js](javascript:%28function%28%29%7B%22use%20strict%22%3Blet%20_scope%3Dfunction%28scope%29%7Bthis.dependencies%3D%5B%5D%3Bthis.scope%3Dscope%3Bthis.load%3Dfunction%28url%29%7Blet%20script%3Ddocument.createElement%28%22script%22%29%3Bscript.src%3Durl%3Blet%20p%3Dnew%20Promise%28%28resolve%2Creject%29%3D%3E%7Bscript.onload%3Dresolve%3Bscript.onerror%3Dfunction%28%29%7Breject%28url%29%7D%7D%29%3Bscope.appendChild%28script%29%3Bthis.dependencies.push%28p%29%7D%3Bthis.run%3Dasync%20function%28func%29%7Bawait%20Promise.all%28this.dependencies%29.catch%28function%28error%29%7Blet%20emsg%3D%60Dependency%20%27%24%7Berror%7D%27%20failed%20to%20load%60%3Balert%28emsg%29%3Bthrow%20emsg%7D%29%3Blet%20script%3Ddocument.createElement%28%22script%22%29%3Bscript.text%3D%60%28%24%7Bfunc.toString%28%29%7D%29%28%29%60%3Bscope.appendChild%28script%29%7D%7D%3Blet%20local_scope%3Dasync%20function%28%29%7Blet%20scope%3Dnew%20_scope%28document.body%29%3Breturn%20scope%7D%3Blet%20iframe_scope%3Dasync%20function%28%29%7Blet%20iframe%3Ddocument.createElement%28%22iframe%22%29%3Biframe.style.display%3D%22none%22%3Blet%20loaded%3Dnew%20Promise%28%28resolve%2Creject%29%3D%3E%7Biframe.onload%3Dresolve%7D%29%3Bdocument.body.appendChild%28iframe%29%3Bawait%20loaded%3Blet%20scope%3Dnew%20_scope%28iframe.contentDocument.body%29%3Breturn%20scope%7D%3Blet%20bookmarklet%3Dasync%20function%28dependencies%2Cfunc%2Cscope%3Diframe_scope%29%7Blet%20iframe%3Dawait%20scope%28%29%3Bfor%28let%20dependency%20of%20dependencies%29%7Biframe.load%28dependency%29%7Diframe.run%28func%29%3Breturn%20iframe%7D%3Bbookmarklet%28%5B%22https%3A//stuk.github.io/jszip/dist/jszip.js%22%2C%22https%3A//stuk.github.io/jszip-utils/dist/jszip-utils.js%22%2C%22https%3A//stuk.github.io/jszip/vendor/FileSaver.js%22%5D%2Cfunction%28%29%7Bfunction%20urlToPromise%28url%29%7Breturn%20new%20Promise%28function%28resolve%2Creject%29%7BJSZipUtils.getBinaryContent%28url%2Cfunction%28err%2Cdata%29%7Bif%28err%29%7Breject%28err%29%7Delse%7Bresolve%28data%29%7D%7D%29%7D%29%7Dlet%20id%3Dwindow.location.href.split%28%22/%22%29.pop%28%29.split%28%22_%22%29.shift%28%29%3Basync%20function%20find_images%28%29%7Blet%20images%3D%5B%5D%3Blet%20i%3D0%3Bwhile%28true%29%7Btry%7Blet%20url%3Dwindow.location.href.replace%28id%2B%22_p0%22%2Cid%2B%22_p%22%2Bi%29%3Blet%20name%3Durl.split%28%22/%22%29.pop%28%29%3Bdata%3Dawait%20urlToPromise%28url%29%3Bimages.push%28%5Bname%2Cdata%5D%29%3Bi%2B%3D1%7Dcatch%28error%29%7Bconsole.log%28error%29%3Bbreak%7D%7Dreturn%20images%7Dasync%20function%20download_images%28images%29%7Bvar%20zip%3Dnew%20JSZip%3Bfor%28%5Bname%2Cdata%5Dof%20images%29%7Bzip.file%28name%2Cdata%2C%7Bbinary%3Atrue%7D%29%7Dzip.generateAsync%28%7Btype%3A%22blob%22%7D%2Cfunction%20updateCallback%28metadata%29%7Bvar%20msg%3D%22progression%20%3A%20%22%2Bmetadata.percent.toFixed%282%29%2B%22%20%25%22%3Bconsole.log%28msg%29%7D%29.then%28function%20callback%28blob%29%7Bfilename%3Did%2B%22.zip%22%3BsaveAs%28blob%2Cfilename%29%3Bconsole.log%28%22done%20%21%22%29%7D%2Cfunction%28e%29%7Balert%28e%29%7D%29%7Dasync%20function%20start%28%29%7Blet%20images%3Dawait%20find_images%28%29%3Bdownload_images%28images%29%7Dstart%28%29%7D%2Clocal_scope%29%7D%29%28%29%3B%0A)
