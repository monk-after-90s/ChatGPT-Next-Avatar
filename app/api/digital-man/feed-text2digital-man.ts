import { haveCommonCharacters } from "@/app/utils";
import { AsyncQueue } from "@/app/utils/async_queue";
import { waitForAudioEvent } from "@/app/utils/wait_for_audio_event";
// 响应的文本分段缓存
// 分隔符
let separators: string = '“”‘’"。,，;；:：、？?！!';
//分段文本队列
let texts = new AsyncQueue<string>();
//缓存
let deltaCache = "";
//数字人流id
let digmanStreamId = "";
//视频播放组件
let vd: HTMLImageElement;

function getVd() {
  if (!vd) {
    vd = document.getElementById("video") as HTMLImageElement;
  }
  return vd;
}

/*
 * 消费文AI响应的本段，输出到数字人流当中
 * */
export function consumedelta(delta: string) {
  //弹窗关闭则不播放数字人
  if (document.getElementById("draggableWindow")?.style.display === "none") {
    delta = "[DONE]";
    return;
  }
  //当前这段字符串没有分割符
  if (!haveCommonCharacters(delta, separators)) {
    deltaCache += delta;
    //结尾
    if (deltaCache.endsWith("[DONE]")) {
      feed2digman(deltaCache);
      deltaCache = "";
    }
  } else {
    let splitStrings = delta.split(new RegExp(`[${separators}]+`, "g"));
    deltaCache += splitStrings.shift();
    //deltaCache一段完成，则发出去合成数字人音视频流
    feed2digman(deltaCache);
    deltaCache = "";
    //还有可以发送的文本
    while (splitStrings.length > 1) {
      let nextText = splitStrings.shift();
      if (nextText) {
        feed2digman(nextText);
      }
    }
    //最后一段缓存起来
    let nextText = splitStrings.shift();
    if (nextText) {
      deltaCache += nextText;
    }
  }
}

/*
 * 将文本喂给数字人流
 * */
function feed2digman(text: string) {
  //队列文本段生产者
  if (text) {
    texts.put(text);
  }
  //没有流，新建流
  if (!digmanStreamId) {
    digmanStreamId = "establishing";
    const selectElement = document.getElementById(
      "digman-select",
    ) as HTMLSelectElement;
    const selectedOption: HTMLOptionElement | null =
      selectElement.options[selectElement.selectedIndex];
    if (selectedOption) {
      const params = new URLSearchParams();
      params.append("digital_man", selectedOption.value);
      fetch(
        `${process.env.DIGMAN_BASEURL}/avSustainStream/establish_stream?` +
          params.toString(),
      )
        .then((response) => response.json())
        .then(async (streamId) => {
          digmanStreamId = streamId;
          console.log(`streamId=${streamId}`);
          let encoded_stream_id = encodeURIComponent(streamId);
          //视频流播放器
          getVd().style.display = "block";
          getVd().src = `${process.env.DIGMAN_BASEURL}/avSustainStream/listen_video_stream?stream_id=${encoded_stream_id}`;
          //消费文本，进行数字人合成
          startConsumeText(encoded_stream_id);
        });
    }
  }
}

async function startConsumeText(encoded_stream_id: string) {
  //语音播放组件
  let ad: HTMLAudioElement | null = null;
  //结束标识
  let done = false;
  while (true) {
    let text = await texts.get();
    if (text.endsWith("[DONE]")) {
      text = text.replaceAll("[DONE]", "");
      done = true;
    }
    if (text) {
      //语音播放组件
      ad = new Audio();
      ad.addEventListener("ended", ad.remove);
      ad.addEventListener("ended", () => {
        console.log(`Text:${text} played.`);
      });
      ad.src = `${process.env.DIGMAN_BASEURL}/avSustainStream/talk?stream_id=${encoded_stream_id}&speech_content=${text}`;
      ad.play();
      //确保顺序后，可以及时切换的时机
      await waitForAudioEvent(ad, "durationchange");
    }
    //结束
    if (done) {
      break;
    }
  }
  //等待最后一个音频播放完毕
  if (ad) await waitForAudioEvent(ad, "ended");
  //关闭流
  const params = new URLSearchParams();
  params.append("stream_id", encoded_stream_id);
  const res = await fetch(
    `${process.env.DIGMAN_BASEURL}/avSustainStream/close_stream?` +
      params.toString(),
  );
  console.log(
    `Close stream:${decodeURIComponent(
      encoded_stream_id,
    )} res:${await res.json()}`,
  );
  digmanStreamId = "";
  getVd().style.display = "none";
  getVd().src = "";
}
