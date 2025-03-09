import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Clock, ArrowUpRight } from 'lucide-react-native';

interface NewsItemProps {
    title: string;
    source: string;
    timeAgo: string;
    imageUrl: string;
    url: string;
}

export const NewsItem: React.FC<NewsItemProps> = ({
    title,
    source,
    timeAgo,
    imageUrl,
    url,
}) => {
    const handlePress = async () => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Error opening URL:', error);
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <View style={styles.footer}>
                    <View style={styles.sourceContainer}>
                        <Text style={styles.source}>{source}</Text>
                        <View style={styles.timeContainer}>
                            <Clock size={12} color="#748CAB" />
                            <Text style={styles.time}>{timeAgo}</Text>
                        </View>
                    </View>
                    <ArrowUpRight size={16} color="#748CAB" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#1B263B',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    image: {
        width: 100,
        height: 100,
    },
    content: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sourceContainer: {
        flex: 1,
    },
    source: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    time: {
        fontSize: 12,
        color: '#748CAB',
    },
}); 