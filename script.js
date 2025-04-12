// 전역 변수 및 설정
let apiKey = "";
const chatEndpoint = "https://api.openai.com/v1/chat/completions";

// 로딩 스피너 관리
const toggleLoadingSpinner = (show) => {
  $('.loading-container').css('display', show ? 'flex' : 'none');
};

// GPT 응답 저장용 객체
let gptResponses = {};

// 초기 모달창
$(document).ready(() => {
  $('#input-apikey').css('display', 'flex');
  $('#step-api').show();   // 첫 화면만 보이게

  // STEP 1 → STEP 2로 이동
  $('#goToTopicInput').on('click', () => {
    const newApiKey = $('#apikeyInput').val();
    if (newApiKey) {
      apiKey = newApiKey;

      // 화면 전환
      $('#step-api').hide();
      $('#step-topic').show();

      // 버튼 텍스트 교체
      $('#saveApikey').text('시작하기 👋');
    } else {
      alert("유효한 API Key를 입력하세요.");
    }
  });

  // STEP 2 → 실행
  $('#saveApikey').on('click', () => {
    const newTopic = $('#topicInput').val().trim();
    if (newTopic) {
      selectedTopic = newTopic;
      alert("API Key와 주제가 설정되었습니다!");
      $('#input-apikey').css('display', 'none');
    } else {
      alert("주제를 입력해주세요.");
    }
  });

  $('#button-result').on('click', handlePromptSubmission);
});



// OpenAI API 호출 함수-------------------------------------------
const callGPT = (prompt, callback) => {
  toggleLoadingSpinner(true);

  $.ajax({
    url: chatEndpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    data: JSON.stringify({
      model: "gpt-4o-mini", //옴니
      messages: [{ role: "user", content: prompt }],
    }),
    success: (data) => {
      toggleLoadingSpinner(false);
      if (callback) callback(data.choices[0].message.content);
    },
    error: () => {
      toggleLoadingSpinner(false);
      alert("Error occurred while calling GPT");
    },
  });
  updateQuestion(currentStep);

};


// 프롬프트 누적 저장용 객체-------------------------------------
let promptHistory = {};
let selectedTopic = "UI/UX 아이디어";



// 프롬프트 생성기
// 기존 generateFullPrompt 함수 → 수정본
function generateFullPrompt() {
  const currentQuestion = $('h2').text().trim(); // 현재 질문
  const userInput = promptHistory[currentQuestion]; // 해당 질문의 입력값

  let prompt = `## 역할 (Role)
당신은 UI/UX 전문가다. 사용자가 입력한 내용을 기반으로 “${selectedTopic}”에 대한 아이디어를 생성해야 한다.

## 목표 (Objective)
아래 내용을 참고하여, 위 주제에 대한 새로운 아이디어를 도출하라.

## 사용자 입력 내용
- ${currentQuestion}: ${userInput}

## 출력 형식 (Output Format)
출력 형식은 제공된 정보를 참고하여 최적의 형식으로 아이디어를 제시하되, 사용자가 읽기 쉽도록 제공하세요.
`;


  return prompt;
}

// 프롬프트 입력 및 결과 표시-----------------------------------
const handlePromptSubmission = () => {
  const userInput = $('#prompt-input').val().trim();
  if (!userInput) {
    alert("프롬프트를 입력하세요.");
    return;
  }

  // 질문 번호 기준으로 저장
  const currentQuestion = $('h2').text().trim();

  // 사용자 입력 저장
  promptHistory[currentQuestion] = userInput;

  // 전체 누적 프롬프트 생성
  const fullPrompt = generateFullPrompt();
  // 콘솔 확인용
  console.log("GPT에게 전달되는 전체 프롬프트 ↓↓↓");
  console.log(fullPrompt);
  // 로딩 표시
  $('#result-output').text("...");

  // GPT 호출
  callGPT(fullPrompt, (response) => {
    $('#result-output').text(response);
    gptResponses[currentQuestion] = response; // 응답 저장!
  });
};




// 질문 데이터-----------------------------------------

const questionData = [
  {
    h2: 'Q1',
    h3: '생성하고자 하는 아이디어가 <span id="h3-point">필요한 이유</span>는 무엇인가요?',
    desc: '아이디어가 필요한 배경이나 문제 상황, 해결하고자 하는 니즈(가치)를 설명해주세요.',
    img: './images/undraw1.png',
    placeholder: 'Ex) 고령자는 콜택시 앱을 사용하기 어려워해서 혼자 택시를 부르기 어려워요.'
  },
  {
    h2: 'Q2',
    h3: '해당 아이디어가 실현되었을 때 <span id="h3-point">어떤 효과</span>가 있을까요?',
    desc: '결과물이 적용되었을 때 기대할 수 있는 변화나 긍정적인 영향을 작성해주세요.',
    img: './images/undraw2.png',
    placeholder: 'Ex) 택시 호출 과정의 단축, 사용 편의성 향상, 고령자 이동권 보장...'
  },
  {
    h2: 'Q3',
    h3: '이 아이디어의 최종 결과물은 <span id="h3-point">어떤 형태</span>로 제공되나요?',
    desc: '제품, 서비스, 시스템 등 결과물이 어떤 모습인지 구체적으로 설명해주세요.',
    img: './images/undraw3.png',
    placeholder: 'Ex) 음성 인식이 가능하여 "택시 불러줘"하면 위치를 추적하여 자동 호출되는 프로토타입'
  },
  {
    h2: 'Q4',
    h3: '이 아이디어를 구현하기 위해 필요한 <span id="h3-point">핵심 기술</span>은 무엇인가요?',
    desc: '개발이나 제작 과정에 활용될 기술, 도구, 방법론 등을 작성해주세요.',
    img: './images/undraw4.png',
    placeholder:'Ex) API 연동, 음성 호츌, 위치 추적 기능, 큰 글씨 UI...'
  },
  {
    h2: 'Q5',
    h3: '실현 과정에서 고려해야 할 <span id="h3-point">제약 조건</span>이 있다면 무엇인가요?',
    desc: '비용, 시간, 인력, 환경적 제약 등 예상되는 제한사항을 작성해주세요.',
    img: './images/undraw5.png',
    placeholder:'Ex)  연구 기간: 최소 3~6개월 (UX 연구, 실험, 프로토타입 개발 포함)/ 비용: 개발 인력, 실험 대상 모집, UX 테스트 비용 발생 /  기술적 제약: AI 보조 기능 등 개발 리소스 필요 / 사회적 제약: 기존 서비스와 협업 필요 여부 고려'
  },
  {
    h2: 'Q6',
    h3: '비슷한 <span id="h3-point">사례</span>나 참고할 만한 <span id="h3-point">예시</span>가 있다면 알려주세요.',
    desc: '기존의 유사한 아이디어, 레퍼런스, 벤치마킹 대상 등을 작성해주세요.',
    img: './images/undraw6.png',
    placeholder: 'Ex) 장애인을 위한 UI/UX 개선 사례, 일본 Softbank Raku-Raku 스마트폰'
  },
  {
    h2: 'Q7',
    h3: '<span id="h3-point">SCAMPER 기법</span> 중 하나를 선택해서 아이디어를 확장해보세요.',
    desc: '아래의 7가지 SCAMPER 기법 중 하나를 골라 아이디어에 적용해보세요.',
    img: './images/undraw7.png',
    placeholder:'Ex)  대체 (Substitute)- 기존 앱 대신 콜센터 기반 예약 시스템을 활성화할 수 있을까?/ 결합 (Combine)- 음성 명령 + QR 코드 기반 예약 시스템을 결합하면 접근성이 높아질까?/ 응용 (Adapt)- 장애인용 UI 설계를 노인 UX에 적용할 수 있을까?/ 수정 (Modify)- 카카오택시 UI에서 필수 입력 필드를 최소화하면 사용성이 개선될까?/ 용도 변경 (Put to another use)- 오프라인에서 종이 티켓 발급을 쉽게 할 방법이 있을까?/ 제거 (Eliminate)- 회원가입, 카드 등록 등 불필요한 절차를 최소화할 수 있을까?/ 뒤집기 (Reverse)- "노인이 디지털을 배워야 한다"는 기존 관점을 뒤집을 수 있을까?'
  }
];



//프로그래스 바 -----------------------------------------
let currentStep = 1;

function updateProgressBar(step) {
  const $steps = $('.step');
  const $lines = $('.line');

  $steps.each(function (index) {
    if (index < step - 1) {
      $(this).removeClass('active').addClass('completed').html('<span class="check">✔</span>');
    } else if (index === step - 1) {
      $(this).removeClass('completed').addClass('active').text(step);
    } else {
      $(this).removeClass('active completed').text(index + 1);
    }
  });

  $lines.each(function (index) {
    if (index < step - 1) {
      $(this).addClass('active');
    } else {
      $(this).removeClass('active');
    }
  });
}

function updateQuestion(step) {
  if (step - 1 < questionData.length) {
    const q = questionData[step - 1];
    $('h2').text(q.h2);
    $('h3').html(q.h3);
    $('.text-wrapper p').text(q.desc);
    $('#img-step').attr('src', q.img);
    $('#prompt-input').attr('placeholder', q.placeholder);

// 버튼 텍스트 조건부 변경
    if (step === 7) {
      $('#button-next').text('실험 완료🧪');
      $('#button-next-mobile').text('실험 완료🧪');
      checkRatingsComplete();
    } else {
      $('#button-next').text('다음 단계');
      $('#button-next-mobile').text('다음 단계');
    }
  }
}

// 이전 버튼------------------------------------------------------
$('#button-pre').on('click', function () {
  if (currentStep <= 1) return;
  currentStep--;
  updateProgressBar(currentStep);
  updateQuestion(currentStep);
});

//별점--------------------------------------------------------

let ratingHistory = {
  '예측 가능성': 0,
  '의도일치성': 0,
  '활용가능성': 0,
  '실현 가능성': 0,
  '창의성(혁신+독창)': 0,
  '가치성': 0,
  '명확성': 0,
};

let tempRating = {
  '예측 가능성': 0,
  '의도일치성': 0,
  '활용가능성': 0,
  '실현 가능성': 0,
  '창의성(혁신+독창)': 0,
  '가치성': 0,
  '명확성': 0,
};

let isFinalBlinkingDone = false; // 깜빡임 플래그

// 별점 모두 평가됐는지 확인하는 함수
function checkRatingsComplete() {
  const allRated = Object.values(tempRating).every(score => score > 0);  // ⭐ 여기!
  if (allRated) {
    $('#button-next').prop('disabled', false).css({
      backgroundColor: '#1673ff',
      color: '#fff',
      cursor: 'pointer'
    });

     // 모바일 버튼도 같이
     $('#button-next-mobile').prop('disabled', false).css({
      backgroundColor: '#1673ff',
      color: '#fff',
      cursor: 'pointer'
    });

    // 마지막 단계(Q7)일 때 평가 끝나면 깜빡이게
    if (currentStep === 7 && !isFinalBlinkingDone) {
      $('#button-save').addClass('blinking');
      isFinalBlinkingDone = true;
    }

  } else {
    $('#button-next').prop('disabled', true).css({
      backgroundColor: ' #e7e7e7',
      color: '#A8A8A8',
      cursor: 'not-allowed'
    });
  // 모바일 버튼도 
    $('#button-next-mobile').prop('disabled', true).css({
      backgroundColor: '#e7e7e7',
      color: '#A8A8A8',
      cursor: 'not-allowed'
    });
  }
}

// 초기화 및 별점 클릭 이벤트
$(document).ready(() => {
  $('#button-next').prop('disabled', true).css({
    backgroundColor: '',
    color: '#A8A8A8',
    cursor: 'not-allowed'
  });

  $('.stars').each(function () {
    const $stars = $(this);
    const stars = '★★★★★'.split('');
    $stars.html('');

    stars.forEach((_, i) => {
      $stars.append(`<span data-value="${i + 1}">★</span>`);
    });

    $stars.on('click', 'span', function () {
      const rating = $(this).data('value');
      const $all = $(this).parent().find('span');
      const category = $(this).closest('.rating-category').data('category');

      $all.removeClass('active');
      $all.each(function (index) {
        if (index < rating) $(this).addClass('active');
      });

      tempRating[category] = rating;
      console.log(`${category} 별점: ${rating}점`);

      checkRatingsComplete();
    });
  });
});



$('#button-next').on('click', function () {
  if (!Object.values(tempRating).every(score => score > 0)) {
    alert(" 모든 항목을 평가해 주세요!");
    return;
  }

  if ($(this).prop('disabled')) return;
  if (currentStep >= $('.step').length) return;

  const questionKey = `Q${currentStep}`;
  ratingHistory[questionKey] = {};

  const otherOpinion = $('#rating-input').val().trim();
  if (otherOpinion) {
    ratingHistory[questionKey]['기타 의견'] = otherOpinion;
  }

  // 별점은 여기서 최종 저장
  ratingHistory[questionKey]['별점 평가'] = { ...tempRating };
  console.log(`✅ ${questionKey} 최종 평가 기록 ↓↓↓`);
  console.log(ratingHistory[questionKey]);

 // 마지막 단계일 경우 버튼 애니메이션 부여
  if (currentStep === 7) {
    $('#button-save').addClass('blinking');
  }
  
  currentStep++;
  updateProgressBar(currentStep);
  updateQuestion(currentStep);

  $('#prompt-input').val('');
  $('#result-output').empty();
  $('.rating-container').hide();
  $('#rating-input').val('');
  $('.stars span').removeClass('active');

  Object.keys(tempRating).forEach(key => {
    tempRating[key] = 0;
  });

  $(this).prop('disabled', true).css({
    backgroundColor: '',
    color: '#A8A8A8',
    cursor: 'not-allowed'
  });
  if (window.innerWidth <= 768) {
    $('main').removeClass('mobile-show-result');
  }
});





$('#button-result').on('click', function () {
  $('#gpt-output').css('display', 'block');
  handlePromptSubmission();

  // rating-container 보이게
  $('.rating-container').show();
});

$('#button-save').on('click', function () {
  const rows = [
    [`실험 주제: ${selectedTopic}`],
    [], // 공백 줄
    ['질문 번호', '입력 내용', '예측 가능성', '의도일치성', '활용가능성', '실현 가능성', '창의성', '가치성', '명확성', '기타 의견', 'GPT 응답']
  ];
  
  // 마지막 질문 수동 저장
  const lastQuestionKey = `Q${currentStep}`;
  if (!ratingHistory[lastQuestionKey]) {
    ratingHistory[lastQuestionKey] = {};
    const otherOpinion = $('#rating-input').val().trim();
    if (otherOpinion) ratingHistory[lastQuestionKey]['기타 의견'] = otherOpinion;
    ratingHistory[lastQuestionKey]['별점 평가'] = { ...tempRating };
  }

  // 데이터 정리
  for (let i = 1; i <= 7; i++) {
    const qKey = `Q${i}`;
    const 평가 = ratingHistory[qKey]?.['별점 평가'] || {};
    const 의견 = ratingHistory[qKey]?.['기타 의견'] || '';
    const 입력내용 = promptHistory[qKey] || '';
    const 응답 = gptResponses[qKey] || '';

    rows.push([
      qKey,
      입력내용,
      평가['예측 가능성'] || '',
      평가['의도일치성'] || '',
      평가['활용가능성'] || '',
      평가['실현 가능성'] || '',
      평가['창의성(혁신+독창)'] || '',
      평가['가치성'] || '',
      평가['명확성'] || '',
      의견,
      응답,
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // 열 너비
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 30 }, { wch: 50 }
  ];

  // 헤더 회색
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cell = XLSX.utils.encode_cell({ c: C, r: 0 });
    if (worksheet[cell]) {
      worksheet[cell].s = {
        fill: { fgColor: { rgb: "D9D9D9" } },
        font: { bold: true }
      };
    }
  }


// ✅ 점수 셀 중 3 미만인 셀 연분홍 배경 입히기
const scoreCols = ['C','D','E','F','G','H','I']; // 점수 컬럼
for (let row = 4; row <= 10; row++) { // Q1~Q7 → 엑셀 기준 4행부터 시작
  scoreCols.forEach((col) => {
    const cellRef = `${col}${row}`;
    const cell = worksheet[cellRef];
    if (cell && Number(cell.v) < 3) {
      if (!cell.s) cell.s = {};
      cell.s.fill = {
        fgColor: { rgb: "FCE4D6" } // 연분홍 색상
      };
    }
  });
}


  // 줄바꿈 셀 범위 설정
const wrapTextCols = ['B', 'J', 'K'];
for (let R = 1; R <= 7; R++) { // Q1~Q7 기준
  wrapTextCols.forEach((col) => {
    const cellAddress = `${col}${R + 3}`; // 실제 데이터는 4번째 줄부터 시작
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        alignment: {
          wrapText: true,
          vertical: 'top'
        }
      };
    }
  });
}



  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '아이디어 평가');

  const now = new Date();
  const timeStamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '');
  const filename = `아이디어_실험_평가_${timeStamp}.xlsx`;

  XLSX.writeFile(workbook, filename, { cellStyles: true }); // 💡 Pro 필요

});




// // 제출하기 버튼 클릭 시, txt 저장 --------------------------------------
// $('#button-save').on('click', function () {
//   let summary = `⭐ 평가 요약 결과\n\n`;

//   for (let i = 1; i <= 7; i++) {
//     const qKey = `Q${i}`;
//     const 평가 = ratingHistory[qKey]?.['별점 평가'] || {};
//     const 의견 = ratingHistory[qKey]?.['기타 의견'] || '';
//     const 입력내용 = promptHistory[qKey] || '[입력 없음]';
//     const 응답 = gptResponses[qKey] || '[GPT 응답 없음]';

//     summary += `📌 ${qKey} ${입력내용}\n`;
//     for (let 항목 in 평가) {
//       summary += `- ${항목}: ${평가[항목]}점\n`;
//     }
//     if (의견) summary += `💬 기타 의견: ${의견}\n`;
//     if (응답) summary += `💡 GPT 응답:\n${응답}\n`;
//     summary += '\n';
//   }



//   // Blob을 생성해서 다운로드
//   const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement('a');
//   a.href = url;

//   const now = new Date();
//   const timeStamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '');
//   a.download = `아이디어_실험_평가_${timeStamp}.txt`;

//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   URL.revokeObjectURL(url); 
// });



window.addEventListener("beforeunload", function (e) {
  if (Object.keys(promptHistory).length > 0 || Object.values(tempRating).some(score => score > 0)) {
    e.preventDefault(); // 표준git
    e.returnValue = ""; // Chrome을 위한 설정
  }
});


document.getElementById('button-result').addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    document.querySelector('main').classList.add('mobile-show-result');
  }
});

$('#button-pre-mobile').on('click', () => {
  $('#button-pre').click();
});
$('#button-next-mobile').on('click', () => {
  

  // 모바일에서 다음 단계 클릭 시 프롬프트 다시 보이게!
  if (window.innerWidth <= 768) {
    $('main').removeClass('mobile-show-result');
  }

  $('#button-next').click();
});



$(window).on('resize', function () {
  if (window.innerWidth <= 768) {
    $('#button-key').hide();
  } else {
    $('#button-key').show();
  }
});



pdateQuesti
