class WebRTCService {

    private peer: RTCPeerConnection | undefined

    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            })
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(offer)
            return offer
        }
    }
}

export default new WebRTCService()