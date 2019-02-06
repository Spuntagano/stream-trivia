type Participants = {
    [s: string]: {
        score: number,
        answer: number,
        answerTimestamp: number,
        name?: string
    }
}

export default Participants;