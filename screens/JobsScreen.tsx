import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const jobsData = [
    { id: "1", name: "BTC-USDT DCA Bot", status: "Running" },
    { id: "2", name: "ETH-USDT Grid Trading", status: "Paused" },
];

export default function JobsScreen() {
    const [jobs, setJobs] = useState(jobsData);

    const handleAction = (jobId:any, action:any) => {
        setJobs(jobs.map(job => job.id === jobId ? { ...job, status: action } : job));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Active Jobs</Text>
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.text}>{item.name} ({item.status})</Text>
                        <TouchableOpacity style={styles.pauseButton} onPress={() => handleAction(item.id, "Paused")}>
                            <Text style={styles.buttonText}>Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resumeButton} onPress={() => handleAction(item.id, "Running")}>
                            <Text style={styles.buttonText}>Resume</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.killButton} onPress={() => handleAction(item.id, "Stopped")}>
                            <Text style={styles.buttonText}>Kill</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0D1B2A", padding: 16 },
    heading: { fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
    text: { color: "white", fontSize: 16, flex: 1 },
    pauseButton: { backgroundColor: "#FFA500", padding: 6, borderRadius: 8 },
    resumeButton: { backgroundColor: "#3B82F6", padding: 6, borderRadius: 8 },
    killButton: { backgroundColor: "#FF4D4D", padding: 6, borderRadius: 8 },
    buttonText: { color: "white", fontWeight: "bold" },
});
