import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

const categories = [
    "Architecture",
    "Art & Fashion",
    "Biography",
    "Business",
    "Crafts & Hobbies",
    "Drama",
    "Fiction",
    "Food & Drink",
    "Health & Wellbeing",
    "History & Politics",
    "Humor",
    "Poetry",
    "Psychology",
    "Science",
    "Technology",
    "Travel & Maps",
];

export const CategorySheetModal = ({
    bottomCategoryModalRef,
    setFilter,
    handleCategoryClose,
}: any) => {
    return (
        <BottomSheetModal
            ref={bottomCategoryModalRef}
            index={0}
            snapPoints={["85%"]}
            enablePanDownToClose
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={styles.filterText}>Filter By Category</Text>

                <BottomSheetScrollView>
                    {categories.map((value, index) => (
                        <TouchableOpacity
                            onPress={() => {
                                setFilter(value);
                                handleCategoryClose();
                            }}
                            style={styles.categories}
                            key={index}
                        >
                            <Text style={{ fontSize: 20 }}>{value}</Text>
                        </TouchableOpacity>
                    ))}
                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

export const BookDetailSheetModal = ({
    bottomBookDetailModalRef,
    bookDetail,
    rentedBooks,
    returnBooks,
    rentBooks,
}: any) => {
    return (
        <BottomSheetModal
            ref={bottomBookDetailModalRef}
            index={0}
            snapPoints={["85%"]}
            enablePanDownToClose
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={{ fontSize: 22, textAlign: "center", paddingBottom: 14 }}>
                    Book Detail
                </Text>

                <ScrollView style={{ flex: 1 }}>
                    <Image
                        resizeMode="contain"
                        style={{ height: 150, width: "100%", borderRadius: 10 }}
                        source={{ uri: bookDetail?.volumeInfo?.imageLinks?.thumbnail }}
                    />
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.bookName,
                            { textAlign: "center", marginVertical: 10 },
                        ]}
                    >
                        {bookDetail?.volumeInfo?.title || ""}
                    </Text>

                    <Text numberOfLines={10} style={styles.bookDescription}>
                        {bookDetail?.volumeInfo?.description || ""}
                    </Text>
                </ScrollView>
                <TouchableOpacity
                    style={styles.rentButton}
                    onPress={() =>
                        rentedBooks?.includes(bookDetail?.id)
                            ? returnBooks(bookDetail?.id)
                            : rentBooks(bookDetail?.id)
                    }
                >
                    <Text style={styles.rentButtonText}>
                        {rentedBooks?.includes(bookDetail?.id)
                            ? "Return Book"
                            : "Rent Book"}
                    </Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    bookName: {
        paddingVertical: 5,
        letterSpacing: 2,
    },
    filterText: {
        fontSize: 22,
        textAlign: "center",
        paddingBottom: 14,
    },
    contentContainer: {
        flex: 1,
        marginBottom: 10,
    },
    categories: {
        marginVertical: 2,
        marginHorizontal: 10,
        padding: 8,
        borderBottomWidth: 0.6,
        borderBottomColor: "grey",
    },
    bookDescription: {
        textAlign: "justify",
        paddingVertical: 10,
        width: "90%",
        alignSelf: "center",
    },
    rentButton: {
        backgroundColor: "#3b537a",
        margin: 10,
        padding: 8,
        borderRadius: 10,
    },
    rentButtonText: {
        textAlign: "center",
        color: "white",
        fontSize: 20,
    },
});