// Данные радиостанций
const radioStations = {
    kissint: {
        name: "KISS FM",
        url: "https://cloud.revma.ihrhls.com/zc185?rj-org=n08a-e2&rj-ttl=5&rj-tok=AAABmWcyp-cAjUh581g70H83Ow",
        description: "Лучшие мировые хиты в отличном качестве",
        currentTrack: "Популярные хиты",
        currentArtist: "KISS FM",
        nextTrack: "Следующий хит",
        nextArtist: "KISS FM",
        quality: "128kbps",
        icon: "fas fa-heart",
        category: "international"
    },
    // ... остальные станции
};

const stationIds = Object.keys(radioStations);

class StationManager {
    constructor() {
        this.currentStationIndex = 0;
        this.currentStation = stationIds[this.currentStationIndex];
    }

    getStation(id) {
        return radioStations[id];
    }

    getAllStations() {
        return radioStations;
    }

    getStationIds() {
        return stationIds;
    }

    setCurrentStation(id) {
        if (stationIds.includes(id)) {
            this.currentStation = id;
            this.currentStationIndex = stationIds.indexOf(id);
            return true;
        }
        return false;
    }

    getNextStation() {
        this.currentStationIndex = (this.currentStationIndex + 1) % stationIds.length;
        this.currentStation = stationIds[this.currentStationIndex];
        return this.currentStation;
    }

    getPrevStation() {
        this.currentStationIndex = (this.currentStationIndex - 1 + stationIds.length) % stationIds.length;
        this.currentStation = stationIds[this.currentStationIndex];
        return this.currentStation;
    }

    getRandomStation() {
        this.currentStationIndex = Math.floor(Math.random() * stationIds.length);
        this.currentStation = stationIds[this.currentStationIndex];
        return this.currentStation;
    }

    filterByCategory(category) {
        if (category === 'all') return stationIds;
        return stationIds.filter(id => radioStations[id].category === category);
    }
}
