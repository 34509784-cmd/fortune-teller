/**
 * 🔮 Fortune Engine — 纯前端算命引擎
 * 所有计算在浏览器中完成，无需后端API
 */

// ========== 基础数据 ==========
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_ELEM: Record<string,string> = {甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'};
const BRANCH_ELEM: Record<string,string> = {子:'water',丑:'earth',寅:'wood',卯:'wood',辰:'earth',巳:'fire',午:'fire',未:'earth',申:'metal',酉:'metal',戌:'earth',亥:'water'};
const HIDDEN_STEMS: Record<string,string[]> = {子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};
const NA_YIN: Record<string,string> = {'甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火','戊辰':'大林木','己巳':'大林木','庚午':'路旁土','辛未':'路旁土','壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火','丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土','庚辰':'白蜡金','辛巳':'白蜡金','壬午':'杨柳木','癸未':'杨柳木','甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土','戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木','壬辰':'长流水','癸巳':'长流水','甲午':'沙中金','乙未':'沙中金','丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木','庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金','甲辰':'覆灯火','乙巳':'覆灯火','丙午':'天河水','丁未':'天河水','戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金','壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水','丙辰':'沙中土','丁巳':'沙中土','戊午':'天上火','己未':'天上火','庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水'};

// Trigram values: 1=yang, 0=yin
const TRI_VALS: Record<string,number[]> = {乾:[1,1,1],兑:[0,1,1],离:[1,0,1],震:[0,0,1],巽:[1,1,0],坎:[0,1,0],艮:[1,0,0],坤:[0,0,0]};

// Complete 64 hexagrams
const HEX_DATA: Record<number,any> = {};
function initHex() {
  const data: [number,string,string,string,string,string,string][] = [
    [1,'乾为天','Qian Wei Tian','䷀','乾','乾','元亨利贞。'],
    [2,'坤为地','Kun Wei Di','䷁','坤','坤','元亨利牝马之贞。'],
    [3,'水雷屯','Shui Lei Zhun','䷂','坎','震','元亨利贞，勿用有攸往。'],
    [4,'山水蒙','Shan Shui Meng','䷃','艮','坎','亨，匪我求童蒙。'],
    [5,'水天需','Shui Tian Xu','䷄','坎','乾','有孚，光亨，贞吉。'],
    [6,'天水讼','Tian Shui Song','䷅','乾','坎','有孚窒惕，中吉终凶。'],
    [7,'地水师','Di Shui Shi','䷆','坤','坎','贞，丈人吉，无咎。'],
    [8,'水地比','Shui Di Bi','䷇','坎','坤','吉，原筮元永贞。'],
    [9,'风天小畜','Feng Tian Xiao Xu','䷈','巽','乾','亨，密云不雨。'],
    [10,'天泽履','Tian Ze Lü','䷉','乾','兑','履虎尾，不咥人，亨。'],
    [11,'地天泰','Di Tian Tai','䷊','坤','乾','小往大来，吉亨。'],
    [12,'天地否','Tian Di Pi','䷋','乾','坤','否之匪人，不利君子贞。'],
    [13,'天火同人','Tian Huo Tong Ren','䷌','乾','离','同人于野，亨。'],
    [14,'火天大有','Huo Tian Da You','䷍','离','乾','元亨。'],
    [15,'地山谦','Di Shan Qian','䷎','坤','艮','亨，君子有终。'],
    [16,'雷地豫','Lei Di Yu','䷏','震','坤','利建侯行师。'],
    [17,'泽雷随','Ze Lei Sui','䷐','兑','震','元亨利贞，无咎。'],
    [18,'山风蛊','Shan Feng Gu','䷑','艮','巽','元亨，利涉大川。'],
    [19,'地泽临','Di Ze Lin','䷒','坤','兑','元亨利贞，至于八月有凶。'],
    [20,'风地观','Feng Di Guan','䷓','巽','坤','盥而不荐，有孚颙若。'],
    [21,'火雷噬嗑','Huo Lei Shi He','䷔','离','震','亨，利用狱。'],
    [22,'山火贲','Shan Huo Bi','䷕','艮','离','亨，小利有攸往。'],
    [23,'山地剥','Shan Di Bo','䷖','艮','坤','不利有攸往。'],
    [24,'地雷复','Di Lei Fu','䷗','坤','震','亨，出入无疾。'],
    [25,'天雷无妄','Tian Lei Wu Wang','䷘','乾','震','元亨利贞，其匪正有眚。'],
    [26,'山天大畜','Shan Tian Da Xu','䷙','艮','乾','利贞，不家食吉。'],
    [27,'山雷颐','Shan Lei Yi','䷚','艮','震','贞吉，观颐自求口实。'],
    [28,'泽风大过','Ze Feng Da Guo','䷛','兑','巽','栋桡，利有攸往。'],
    [29,'坎为水','Kan Wei Shui','䷜','坎','坎','习坎，有孚维心亨。'],
    [30,'离为火','Li Wei Huo','䷝','离','离','利贞，亨，畜牝牛吉。'],
    [31,'泽山咸','Ze Shan Xian','䷞','兑','艮','亨利贞，取女吉。'],
    [32,'雷风恒','Lei Feng Heng','䷟','震','巽','亨，无咎，利贞。'],
    [33,'天山遁','Tian Shan Dun','䷠','乾','艮','亨，小利贞。'],
    [34,'雷天大壮','Lei Tian Da Zhuang','䷡','震','乾','利贞。'],
    [35,'火地晋','Huo Di Jin','䷢','离','坤','康侯用锡马蕃庶。'],
    [36,'地火明夷','Di Huo Ming Yi','䷣','坤','离','利艰贞。'],
    [37,'风火家人','Feng Huo Jia Ren','䷤','巽','离','利女贞。'],
    [38,'火泽睽','Huo Ze Kui','䷥','离','兑','小事吉。'],
    [39,'水山蹇','Shui Shan Jian','䷦','坎','艮','利西南不利东北。'],
    [40,'雷水解','Lei Shui Xie','䷧','震','坎','利西南，无所往。'],
    [41,'山泽损','Shan Ze Sun','䷨','艮','兑','有孚，元吉，无咎。'],
    [42,'风雷益','Feng Lei Yi','䷩','巽','震','利有攸往，利涉大川。'],
    [43,'泽天夬','Ze Tian Guai','䷪','兑','乾','扬于王庭，孚号有厉。'],
    [44,'天风姤','Tian Feng Gou','䷫','乾','巽','女壮，勿用取女。'],
    [45,'泽地萃','Ze Di Cui','䷬','兑','坤','亨，王假有庙。'],
    [46,'地风升','Di Feng Sheng','䷭','坤','巽','元亨，用见大人。'],
    [47,'泽水困','Ze Shui Kun','䷮','兑','坎','亨，贞大人吉。'],
    [48,'水风井','Shui Feng Jing','䷯','坎','巽','改邑不改井。'],
    [49,'泽火革','Ze Huo Ge','䷰','兑','离','巳日乃孚，元亨利贞。'],
    [50,'火风鼎','Huo Feng Ding','䷱','离','巽','元吉，亨。'],
    [51,'震为雷','Zhen Wei Lei','䷲','震','震','亨，震来虩虩。'],
    [52,'艮为山','Gen Wei Shan','䷳','艮','艮','艮其背，不获其身。'],
    [53,'风山渐','Feng Shan Jian','䷴','巽','艮','女归吉，利贞。'],
    [54,'雷泽归妹','Lei Ze Gui Mei','䷵','震','兑','征凶，无攸利。'],
    [55,'雷火丰','Lei Huo Feng','䷶','震','离','亨，王假之勿忧。'],
    [56,'火山旅','Huo Shan Lü','䷷','离','艮','小亨，旅贞吉。'],
    [57,'巽为风','Xun Wei Feng','䷸','巽','巽','小亨，利有攸往。'],
    [58,'兑为泽','Dui Wei Ze','䷹','兑','兑','亨，利贞。'],
    [59,'风水涣','Feng Shui Huan','䷺','巽','坎','亨，王假有庙。'],
    [60,'水泽节','Shui Ze Jie','䷻','坎','兑','亨，苦节不可贞。'],
    [61,'风泽中孚','Feng Ze Zhong Fu','䷼','巽','兑','豚鱼吉，利涉大川。'],
    [62,'雷山小过','Lei Shan Xiao Guo','䷽','震','艮','亨，利贞，可小事。'],
    [63,'水火既济','Shui Huo Ji Ji','䷾','坎','离','亨小，利贞，初吉终乱。'],
    [64,'火水未济','Huo Shui Wei Ji','䷿','离','坎','亨，小狐汔济。'],
  ];
  data.forEach(([n,name,pinyin,char,up,lo,j]) => {
    HEX_DATA[n as number] = {number:n,name,pinyin,character:char,upperTrigram:up,lowerTrigram:lo,judgment:j};
  });
}
initHex();

// Line texts
const LINE_DEFAULT = ['潜龙勿用，宜待时机。','见龙在田，利见大人。','终日乾乾，谨慎行事。','或跃在渊，进退有度。','飞龙在天，大有所为。','亢龙有悔，物极必反。'];

// ========== 八字排盘 ==========
export function calcBazi(input: {birthDate:string; birthTime?:string; gender?:string; longitude?:number; latitude?:number; calendarType?:string}) {
  const {birthDate, birthTime='12:00', gender='MALE'} = input;
  const [y,m,d] = birthDate.split('-').map(Number);
  const [hh] = birthTime.split(':').map(Number);

  // 年柱
  const yearStem = STEMS[(y-4)%10], yearBranch = BRANCHES[(y-4)%12];

  // 月柱（简化：按节气近似）
  const monthIdx = (m-1);
  const monthStem = STEMS[((y-4)%10*2 + monthIdx)%10], monthBranch = BRANCHES[monthIdx];

  // 日柱（简化：按公历日期推算）
  const baseDate = new Date(1900,0,1).getTime();
  const targetDate = new Date(y,m-1,d).getTime();
  const dayDiff = Math.floor((targetDate - baseDate)/86400000);
  const dayStem = STEMS[(dayDiff+9)%10], dayBranch = BRANCHES[(dayDiff+3)%12];

  // 时柱
  const hourIdx = Math.floor(hh/2);
  const dayStemIdx = STEMS.indexOf(dayStem);
  const hourStem = STEMS[(dayStemIdx*2 + hourIdx)%10], hourBranch = BRANCHES[hourIdx%12];

  const fourPillars = {
    year: { stem: yearStem, branch: yearBranch, hiddenStems: HIDDEN_STEMS[yearBranch] },
    month: { stem: monthStem, branch: monthBranch, hiddenStems: HIDDEN_STEMS[monthBranch] },
    day: { stem: dayStem, branch: dayBranch, hiddenStems: HIDDEN_STEMS[dayBranch] },
    hour: { stem: hourStem, branch: hourBranch, hiddenStems: HIDDEN_STEMS[hourBranch] },
  };

  // 纳音
  const naYin: Record<string,string> = {};
  for (const [k,p] of Object.entries(fourPillars)) {
    naYin[k] = NA_YIN[p.stem + p.branch] || '';
  }

  // 十神
  const tenGods = calcTenGods(dayStem, fourPillars);

  // 五行
  const fiveElements: Record<string,number> = {wood:0,fire:0,earth:0,metal:0,water:0};
  for (const p of Object.values(fourPillars)) {
    fiveElements[STEM_ELEM[p.stem]] = (fiveElements[STEM_ELEM[p.stem]]||0)+1;
    fiveElements[BRANCH_ELEM[p.branch]] = (fiveElements[BRANCH_ELEM[p.branch]]||0)+1;
  }

  // 五行平衡
  const elemCN: Record<string,string> = {wood:'木',fire:'火',earth:'土',metal:'金',water:'水'};
  let strong='wood', weak='wood', maxV=0, minV=Infinity;
  for (const [k,v] of Object.entries(fiveElements)) { if(v>maxV){maxV=v;strong=k;} if(v<minV){minV=v;weak=k;} }

  // 大运
  const daYun = calcDaYun(monthStem, monthBranch, dayStem, gender);

  // 神煞
  const shenSha = calcShenSha(fourPillars, dayStem);

  // 解读
  const readingText = `## 📜 八字排盘解读

### 四柱八字
| | 年柱 | 月柱 | 日柱 | 时柱 |
|------|------|------|------|------|
| 天干 | ${yearStem} | ${monthStem} | **${dayStem}** | ${hourStem} |
| 地支 | ${yearBranch} | ${monthBranch} | ${dayBranch} | ${hourBranch} |
| 纳音 | ${naYin.year} | ${naYin.month} | ${naYin.day} | ${naYin.hour} |
| 十神 | ${tenGods.year} | ${tenGods.month} | 日主 | ${tenGods.hour} |

### ☀️ 日主分析
您的日主为 **${dayStem}**，五行属**${elemCN[STEM_ELEM[dayStem]]}**。

### ⚖️ 五行平衡
${elemCN[strong]}偏旺，${elemCN[weak]}偏弱。建议在生活中补充${elemCN[weak]}元素的能量。

${shenSha.length>0 ? '### 🌟 神煞\n'+shenSha.map(s=>`- **${s.name}**（${s.pillar}柱）— ${s.type}`).join('\n') : ''}
`;

  return { fourPillars, dayMaster:dayStem, tenGods, fiveElements, daYun, shenSha, naYin, elementBalance:{strongest:elemCN[strong],weakest:elemCN[weak],advice:`五行${elemCN[strong]}旺，多补${elemCN[weak]}`}, readingText };
}

function calcTenGods(dm: string, pillars: any) {
  const dmIdx = STEMS.indexOf(dm);
  const getTG = (stem: string) => {
    const sIdx = STEMS.indexOf(stem);
    if (STEM_ELEM[dm] === STEM_ELEM[stem]) return dmIdx%2===sIdx%2?'比肩':'劫财';
    const order=['wood','fire','earth','metal','water'];
    const di=order.indexOf(STEM_ELEM[dm]), si=order.indexOf(STEM_ELEM[stem]);
    if((di+1)%5===si) return dmIdx%2===sIdx%2?'食神':'伤官';
    if((di+2)%5===si) return dmIdx%2===sIdx%2?'偏财':'正财';
    if((di+4)%5===si) return dmIdx%2===sIdx%2?'偏印':'正印';
    return dmIdx%2===sIdx%2?'七杀':'正官';
  };
  return {year:getTG(pillars.year.stem), month:getTG(pillars.month.stem), day:'日主', hour:getTG(pillars.hour.stem)};
}

function calcDaYun(ms:string, mb:string, ds:string, gender:string) {
  const sI=STEMS.indexOf(ms), bI=BRANCHES.indexOf(mb);
  const yangStem = STEMS.indexOf(ds)%2===0;
  const yangGender = gender==='MALE';
  const forward = (yangStem&&yangGender) || (!yangStem&&!yangGender);
  return Array.from({length:8},(_,i)=>({
    startAge:3+i*10, endAge:12+i*10,
    stem:STEMS[((sI+(forward?i+1:-(i+1)))%10+10)%10],
    branch:BRANCHES[((bI+(forward?i+1:-(i+1)))%12+12)%12],
    direction: forward?'forward':'reverse',
  }));
}

function calcShenSha(pillars:any, ds:string) {
  const result: Array<{name:string;pillar:string;type:string}> = [];
  const tianYi: Record<string,string[]> = {甲:['丑','未'],戊:['丑','未'],乙:['子','申'],己:['子','申'],丙:['亥','酉'],丁:['亥','酉'],庚:['午','寅'],辛:['午','寅'],壬:['巳','卯'],癸:['巳','卯']};
  const wenChang: Record<string,string> = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
  const ty = tianYi[ds]||[];
  for(const [k,p] of Object.entries(pillars) as any) {
    if(ty.includes(p.branch)) result.push({name:'天乙贵人',pillar:k,type:'吉'});
    if(p.branch===wenChang[ds]) result.push({name:'文昌贵人',pillar:k,type:'吉'});
  }
  return result;
}

// ========== 八卦占卜 ==========
export function calcBagua(input: {question:string; method?:string; manualLines?:number[]}) {
  const {question, method='AUTO', manualLines} = input;
  let lines: number[];
  if (method==='COINS' && manualLines?.length===6) lines=manualLines;
  else lines=Array.from({length:6},()=>{
    const c1=Math.random()<0.5?2:3, c2=Math.random()<0.5?2:3, c3=Math.random()<0.5?2:3;
    return c1+c2+c3;
  });

  const changing = lines.map((v,i)=>v===6||v===9?i+1:0).filter(Boolean);
  const primaryNum = linesToHexagram(lines);
  const primary = {...HEX_DATA[primaryNum], lines:LINE_DEFAULT.map((t,i)=>({lineNumber:i+1,text:t,meaning:t}))};
  let changed: any = undefined;
  if (changing.length>0) {
    const cl = lines.map(v=>v===6?7:v===9?8:v);
    const cNum = linesToHexagram(cl);
    changed = {...HEX_DATA[cNum], lines:primary.lines};
  }

  const lineDisplay = (v:number) => {
    switch(v){case 6:return '━ ━ ✕ 老阴';case 7:return '━━━ 少阳';case 8:return '━ ━ 少阴';case 9:return '━━━ ○ 老阳';default:return '?';}
  };

  let readingText = `## 🔮 八卦占卜

**您的问题**: ${question}

### 📜 本卦：${primary.character} ${primary.name}（第${primary.number}卦）

**卦辞**：${primary.judgment}

`;
  if (changed) {
    readingText += `### 🔄 变卦：${changed.character} ${changed.name}（第${changed.number}卦）

**变卦卦辞**：${changed.judgment}

### ⚡ 动爻
`;
    changing.forEach(ln => {
      readingText += `- 第${ln}爻：${lineDisplay(lines[ln-1])}\n`;
    });
  } else {
    readingText += `本卦六爻安静，无动爻。当前局势稳定。\n`;
  }

  readingText += '\n### 🙏 占卜提示\n心诚则灵。卦象是镜子，照见的是你内心的答案。';

  return { primaryHexagram:primary, changedHexagram:changed, changingLines:changing, lines, readingText };
}

function linesToHexagram(lines: number[]): number {
  const loBits = lines.slice(0,3).map(v=>v===7||v===9?1:0);
  const upBits = lines.slice(3,6).map(v=>v===7||v===9?1:0);
  const loName = bitsToName(loBits), upName = bitsToName(upBits);
  for (const h of Object.values(HEX_DATA)) {
    if (h.lowerTrigram===loName && h.upperTrigram===upName) return h.number;
  }
  return 1;
}
function bitsToName(bits: number[]): string {
  for (const [k,v] of Object.entries(TRI_VALS)) if(v.join(',')===bits.join(',')) return k;
  return '乾';
}

// ========== 奇门遁甲 ==========
export function calcQimen(input: {queryDateTime:string; method?:string}) {
  const {queryDateTime} = input;
  const d = new Date(queryDateTime);
  const ju = ((d.getMonth()+1)*2 + d.getDate() + d.getHours())%9+1;
  const isYang = d.getMonth() >= 5 && d.getMonth() <= 10;
  const dirs = ['坎','坤','震','巽','中','乾','兑','艮','离'];
  const luoOrder = [5,6,7,8,9,1,2,3,4];
  const doors = ['休','生','伤','杜','景','死','惊','开'];
  const stars = ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英'];
  const gods = isYang ? ['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天'] : ['值符','九天','九地','玄武','白虎','六合','太阴','螣蛇'];

  const palaces = luoOrder.map((n,i) => ({
    number:n, direction:dirs[n-1]||'中',
    earthStem:STEMS[(i-ju+1+9)%9],
    heavenStem:STEMS[(i+d.getMonth())%10],
    door:doors[(i+d.getHours()+ju)%8],
    star:stars[(i+ju)%9],
    god:gods[(i+ju-1)%8],
  }));

  return {
    juNumber:ju, yinYangDun:isYang?'阳遁':'阴遁', palaces,
    zhiFu:stars[ju%9], zhiShi:doors[0],
    eightDoors:doors, nineStars:stars, eightGods:gods,
    readingText: `## 🎯 奇门遁甲排盘

### 📐 基本信息
- **局数**：${isYang?'阳遁':'阴遁'}${ju}局
- **值符**：${stars[ju%9]}
- **值使**：${doors[0]}

### 🏯 九宫格

| 宫 | 方 | 地盘 | 天盘 | 八门 | 九星 | 八神 |
|----|----|------|------|------|------|------|
${palaces.map(p=>`| ${p.number} | ${p.direction} | ${p.earthStem} | ${p.heavenStem} | ${p.door} | ${p.star} | ${p.god} |`).join('\n')}

### 🌟 简要分析
开门代表事业，生门代表财运，休门代表休养。找出开门和生门所在宫位，即是今日的机遇方向。`,
  };
}

// ========== 星座星盘 ==========
export function calcZodiac(input: {birthDateTime:string; longitude?:number; latitude?:number; houseSystem?:string}) {
  const {birthDateTime} = input;
  const bd = new Date(birthDateTime);
  const signs = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const signCN: Record<string,string> = {Aries:'白羊座',Taurus:'金牛座',Gemini:'双子座',Cancer:'巨蟹座',Leo:'狮子座',Virgo:'处女座',Libra:'天秤座',Scorpio:'天蝎座',Sagittarius:'射手座',Capricorn:'摩羯座',Aquarius:'水瓶座',Pisces:'双鱼座'};
  const signEmoji: Record<string,string> = {Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓'};
  const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const planetCN: Record<string,string> = {Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星',Uranus:'天王星',Neptune:'海王星',Pluto:'冥王星'};
  const planetEmoji: Record<string,string> = {Sun:'☀️',Moon:'🌙',Mercury:'☿️',Venus:'♀️',Mars:'♂️',Jupiter:'♃',Saturn:'♄',Uranus:'♅',Neptune:'♆',Pluto:'♇'};
  const dayOfYear = Math.floor((bd.getTime() - new Date(bd.getFullYear(),0,1).getTime())/86400000);

  const sunSign = signs[Math.floor(((bd.getMonth()+1)*30+bd.getDate())/30)%12];
  const moonSign = signs[(Math.floor(((bd.getMonth()+1)*30+bd.getDate())/30)+3)%12];
  const ascSign = signs[Math.floor(bd.getHours()/2)%12];

  const planets = planetNames.map((name,i) => {
    const s = signs[(Math.floor(dayOfYear*0.9856/30) + i*37 + bd.getHours())%12];
    return {
      name, sign:s,
      degree: Math.round((dayOfYear*0.9856 + i*37.5)%30 * 100)/100,
      house: ((i+Math.floor(bd.getHours()/2))%12)+1,
      retrograde: i<=2?false:Math.sin(dayOfYear*(0.02+i*0.005))<-0.3,
      signEmoji: signEmoji[s],
    };
  });

  const houses = Array.from({length:12},(_,i) => {
    const s = signs[(i+Math.floor(bd.getHours()/2))%12];
    return {number:i+1, sign:s, degree:Math.round(i*30*100)/100, cuspDegree:Math.round((i*30+bd.getHours()*15)*100)/100};
  });

  // Aspects
  const aspectTypes = [{name:'conjunction',angle:0,orb:8,label:'合相'},{name:'sextile',angle:60,orb:6,label:'六分相'},{name:'square',angle:90,orb:8,label:'四分相'},{name:'trine',angle:120,orb:8,label:'三分相'},{name:'opposition',angle:180,orb:8,label:'对分相'}];
  const aspects: Array<{planet1:string;planet2:string;type:string;orb:number;isApplying:boolean}> = [];
  for (let i=0;i<planets.length;i++) {
    for (let j=i+1;j<planets.length;j++) {
      const d1 = signs.indexOf(planets[i].sign)*30 + planets[i].degree;
      const d2 = signs.indexOf(planets[j].sign)*30 + planets[j].degree;
      let diff = Math.abs(d1-d2); if(diff>180) diff=360-diff;
      for (const at of aspectTypes) {
        if (Math.abs(diff-at.angle) <= at.orb) {
          aspects.push({planet1:planets[i].name,planet2:planets[j].name,type:at.name,orb:Math.round(Math.abs(diff-at.angle)*100)/100,isApplying:Math.abs(diff-at.angle)>1});
          break;
        }
      }
    }
  }

  // Elements
  const elemMap: Record<string,string> = {Aries:'fire',Leo:'fire',Sagittarius:'fire',Taurus:'earth',Virgo:'earth',Capricorn:'earth',Gemini:'air',Libra:'air',Aquarius:'air',Cancer:'water',Scorpio:'water',Pisces:'water'};
  const modMap: Record<string,string> = {Aries:'cardinal',Cancer:'cardinal',Libra:'cardinal',Capricorn:'cardinal',Taurus:'fixed',Leo:'fixed',Scorpio:'fixed',Aquarius:'fixed',Gemini:'mutable',Virgo:'mutable',Sagittarius:'mutable',Pisces:'mutable'};
  const elements: Record<string,number> = {fire:0,earth:0,air:0,water:0};
  const modalities: Record<string,number> = {cardinal:0,fixed:0,mutable:0};
  planets.forEach(p=>{elements[elemMap[p.sign]]=(elements[elemMap[p.sign]]||0)+1;modalities[modMap[p.sign]]=(modalities[modMap[p.sign]]||0)+1;});

  let readingText = `## 🌌 星座星盘解读

### ☀️ 基础信息
- **太阳星座**：${signCN[sunSign]||sunSign} ${signEmoji[sunSign]}
- **月亮星座**：${signCN[moonSign]||moonSign} ${signEmoji[moonSign]}
- **上升星座**：${signCN[ascSign]||ascSign} ${signEmoji[ascSign]}

### 🪐 行星位置
${planets.map(p=>`- **${planetCN[p.name]||p.name}** ${planetEmoji[p.name]}：${signCN[p.sign]||p.sign} ${p.signEmoji} ${p.degree.toFixed(1)}° — 第${p.house}宫${p.retrograde?' (逆行)':''}`).join('\n')}

### ⚖️ 元素分布
| 火🔥 | 土⛰️ | 风💨 | 水💧 |
|------|------|------|------|
| ${elements.fire||0} | ${elements.earth||0} | ${elements.air||0} | ${elements.water||0} |

${aspects.length>0?`### 🔗 主要相位\n${aspects.slice(0,6).map(a=>`- ${planetCN[a.planet1]||a.planet1} ${aspectTypes.find(t=>t.name===a.type)?.label||a.type} ${planetCN[a.planet2]||a.planet2}`).join('\n')}`:''}
`;

  return {planets, houses, ascendant:`${signCN[ascSign]||ascSign} ${bd.getMinutes()}°`, midheaven:`${signCN[signs[(signs.indexOf(ascSign)+3)%12]]||''} 0°`, aspects, elements, modalities, sunSign, moonSign, readingText};
}
