export type Annotation = {
  text: string;
  reason: string;
  severity: "critical" | "warning" | "info";
};

export type RateCvApiRes = {
  job_title: string;
  muc_do_phu_hop: number;
  diem_tong: number;
  nhan_xet_tong_quan: string;
  recommend_query: string;
  diem_chi_tiet: {
    trinh_bay: number;
    noi_dung: number;
    kinh_nghiem: number;
    ky_nang: number;
    thanh_tuu: number;
  };
  uu_diem: string[];
  can_cai_thien: string[];
  goi_y_chi_tiet: string;
  annotations?: Annotation[];
  annotated_pdf_b64?: string;
};

export type CvEvaluateReport = {
  score: number;            // diem_tong
  jobTitle: string;         // job_title (AI)
  fitScore: number;         // muc_do_phu_hop
  summary: string;          // nhan_xet_tong_quan
  strengths: string[];      // uu_diem
  weaknesses: string[];     // can_cai_thien
  fixes: string;            // goi_y_chi_tiet
  detailScores: RateCvApiRes["diem_chi_tiet"];
  recommendQuery: string;   // recommend_query
  annotations?: Annotation[];
  annotatedPdfB64?: string;
};

export type DraftData = {
  jobTitle: string;         // input user
  evaluatedAtIso: string;
  fileName: string;
  report: CvEvaluateReport;
};

export function normalizeRateCv(data: RateCvApiRes): CvEvaluateReport {
  return {
    score: Number(data.diem_tong ?? 0),
    jobTitle: data.job_title || "",
    fitScore: Number(data.muc_do_phu_hop ?? 0),
    summary: data.nhan_xet_tong_quan || "",
    strengths: Array.isArray(data.uu_diem) ? data.uu_diem : [],
    weaknesses: Array.isArray(data.can_cai_thien) ? data.can_cai_thien : [],
    fixes: (data.goi_y_chi_tiet || "").replace(/\r\n/g, "\n").trim(),
    detailScores: data.diem_chi_tiet,
    recommendQuery: data.recommend_query || "",
    annotations: Array.isArray(data.annotations) ? data.annotations : [],
    annotatedPdfB64: data.annotated_pdf_b64 || "",
  };
}