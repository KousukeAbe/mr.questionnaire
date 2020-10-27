let student_data, title;
const load_csv = async () => {
  const file = document.getElementById('file');
  if(file.files.length <= 0){
    alert('csv file is not selected');
    return;
  };
  const reader = new FileReader();
  reader.readAsText(file.files[0]);
  reader.onload = async () =>{
    [student_data, title] = await aggregate_data(reader.result);
    await out_lesson_num(student_data);
    await out_lesson_num(student_data);
  }
}

const aggregate_data = async (data) => {
  const student_data = [];
  const split_data = data.split('\n');
  const title = split_data.shift().split(',');
  title.shift();
  for(let i of split_data){
    const split_data = i.split(',').map(remove_quotation);
    split_data.shift();
    student_data.push(split_data);
  }
  return [student_data, title];
}

const remove_quotation = (str) => {
  return str.replace(/\"/g, "");
}

const out_lesson_num = async (data) => {
  const lesson_num = {};
  for(let i of data){
    if(lesson_num[i[0]]){
      lesson_num[i[0]]++;
    }else{
      lesson_num[i[0]] = 1;
    }
  }
  const lesson_num_keys = Object.keys(lesson_num);
  let lesson_num_html = "";
  for(let i of lesson_num_keys){
    lesson_num_html += `<option value=${i}>第${i}回:${lesson_num[i]}人</option>`;
  }

  const select_lesson_num = document.getElementById("select_lesson_num");
  select_lesson_num.innerHTML = `
    <label>講義回を選択：</label>
    <select id="lesson_nums">
      ${lesson_num_html}
    </select>
    <button onclick="data_sort()">グラフ表示</button>
  `;
}

const data_sort = async () => {
  const data_container = [];
  for(let i in title)data_container.push({});
  const lesson_nums = document.getElementById("lesson_nums").value;
  for(let i of student_data){
    if(i[0] !== lesson_nums)continue;
    for(let p in data_container){
      if(data_container[p][i[p]]){
        data_container[p][i[p]]++;
      }else{
        data_container[p][i[p]] = 1;
      }
    }
  }

  await display_graph(data_container);
}

const display_graph = async (data) => {
  for(let i in data){
    const key = Object.keys(data[i]);
    const value = [];

    const target = "container" + i;
    if(i >= 8){
      const text = document.getElementById(target);
      text.innerHTML = `<h2>${title[i]}</h2>`;
      for(let p of key){
        text.innerHTML += `<p>${p}：${data[i][p]}人</p><br>`;
      }
      continue;
    }

    for(let p of key){
      if(p == "")continue;
      value.push({
        name:p,
        y:data[i][p]
      })
    }

    Highcharts.chart(target, {
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: title[i]
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.y}人</b>'
      },
      accessibility: {
          point: {
              valueSuffix: '%'
          }
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.y}人'
              }
          }
      },
      series: [{
          name: '人数',
          colorByPoint: true,
          data: value
      }]
    });
  }
}
