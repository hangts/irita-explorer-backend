
export default class Utils {
    static getCurrentTime(){
        return parseInt(String(new Date().getTime()/1000));
    }
}
