


document.getElementById('select-source').addEventListener('click', async () => {
  console.log('点击了选择源目录按钮');
  try {
    const dirHandle = await window.showDirectoryPicker();
    console.log('源目录已选择:', dirHandle);
    window.sourceDirHandle = dirHandle;
  } catch (err) {
    console.error('选择源目录出错:', err);
  }
});
    // 选择目标目录
    document.getElementById('select-target').addEventListener('click', async () => {
      try {
        const dirHandle = await window.showDirectoryPicker();
        console.log('目标目录已选择:', dirHandle);
        window.targetDirHandle = dirHandle; // 存储目标目录句柄
      } catch (err) {
        console.error('选择目标目录出错:', err);
      }
    });

    // 点击“转换”按钮
    document.getElementById('convert').addEventListener('click', async () => {
      const formats = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value);
      if (!window.sourceDirHandle || !window.targetDirHandle || formats.length === 0) {
        alert('请先选择源目录、目标目录和目标格式');
        return;
      }

      try {
        await convertImages(window.sourceDirHandle, window.targetDirHandle, formats);
        alert('转换完成');
      } catch (err) {
        console.error('转换过程中出错:', err);
        alert('转换失败');
      }
    });

    // 批量转换图片
    async function convertImages(sourceDirHandle, targetDirHandle, formats) {
  const entries = await sourceDirHandle.values();
  const promises = [];
  
  for await (const entry of entries) {
    if (entry.kind === 'file' && isImageFile(entry.name)) {
      const file = await entry.getFile();
      const img = await loadImage(file);
      
      // 使用 for...of 替代 forEach
      for (const format of formats) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const blob = await new Promise(resolve => 
          canvas.toBlob(resolve, `image/${format}`)
        );
        
        const newFileName = entry.name.replace(/\.[^/.]+$/, `.${format}`);
        promises.push(saveFile(targetDirHandle, newFileName, blob));
      }
    }
  }
  
  await Promise.all(promises);
}

    // 判断是否为图片文件
    function isImageFile(fileName) {
      const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
      return extensions.some(ext => fileName.toLowerCase().endsWith(ext));
    }

    // 加载图片
    function loadImage(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }

    // 保存转换后的文件
    async function saveFile(dirHandle, fileName, blob) {
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    }
