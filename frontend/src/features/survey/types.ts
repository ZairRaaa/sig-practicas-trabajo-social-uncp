export type SurveyKind = 'priorities' | 'experience'
export interface Block { title: string; instruction: string; scale: string[]; items: { id: string; text: string }[] }
export interface Instrument { version: string; is_pilot: boolean; enabled: boolean; notice: string; blocks: Record<SurveyKind, Block> }
export interface Participation { priorities_submitted: boolean; experiences: { id: string; site_name: string; period: string; is_demo: boolean; submitted: boolean }[] }
