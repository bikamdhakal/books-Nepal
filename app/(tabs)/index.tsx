import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { debounce } from "lodash";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookDetailSheetModal, CategorySheetModal } from "@/components/modal";

export default function HomeScreen() {
  const bottomCategoryModalRef = useRef<BottomSheetModal>(null);
  const bottomBookDetailModalRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState("Nepal");
  const [filter, setFilter] = useState("Architecture");
  const [books, setBooks] = useState([]);
  const [bookDetail, setBookDetail] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [rentedBooks, setRentedBooks] = useState<string[]>([]);

  const getBooks = async (query: string) => {
    try {
      if (!query) {
        setLoading(false);
        return;
      }
      setLoading(true);
      await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query},subject:${filter}&startIndex=0&maxResults=40`
      )
        .then((response) => response.json())
        .then((json) => {
          setBooks(json?.items);
          setLoading(false);
          return json;
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.log("see etr", error);
    }
  };

  const debouncedSearch = React.useRef(
    debounce((text: string) => {
      setQuery(text);
    }, 300)
  ).current;

  useEffect(() => {
    getBooks(query);
  }, [query, filter]);

  // callbacks
  const handleCategoryOpen = useCallback(() => {
    bottomBookDetailModalRef.current?.close();
    bottomBookDetailModalRef.current?.collapse();
    bottomBookDetailModalRef.current?.dismiss();
    bottomCategoryModalRef.current?.present();
  }, [bottomBookDetailModalRef, bottomCategoryModalRef]);

  const handleBookPress = useCallback((item: any) => {
    setBookDetail(item);
    bottomBookDetailModalRef.current?.present();
    bottomCategoryModalRef.current?.close();
  }, []);

  const handleCategoryClose = useCallback(() => {
    bottomCategoryModalRef?.current?.close();
    bottomBookDetailModalRef?.current?.close();
    bottomBookDetailModalRef?.current?.collapse();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("rentedBooks");
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };

  const rentBooks = async (value: string) => {
    try {
      const jsonValue = await getData();
      if (jsonValue) {
        setRentedBooks([...rentedBooks, value]);
        await AsyncStorage.setItem(
          "rentedBooks",
          JSON.stringify([...jsonValue, value])
        );
      } else {
        setRentedBooks([value]);
        await AsyncStorage.setItem("rentedBooks", JSON.stringify([value]));
      }
      Alert.alert("Books Nepal", "You have rented this book", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => bottomBookDetailModalRef.current?.dismiss(),
        },
      ]);
    } catch (e) { }
  };

  const returnBooks = async (value: string) => {
    try {
      const jsonValue = await getData();
      if (jsonValue) {
        const data = jsonValue.filter((val: string) => val !== value);
        setRentedBooks(data);
        await AsyncStorage.setItem("rentedBooks", JSON.stringify(data));
        Alert.alert("Books Nepal", "You have returned this book", [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => bottomBookDetailModalRef.current?.dismiss(),
          },
        ]);
      }
    } catch (e) { }
  };

  useEffect(() => {
    (async () => {
      const values = await getData();

      if (values) {
        setRentedBooks(values);
      }
    })();
  }, []);

  const renderBooks = ({ item }: any) => {
    const bookName = item?.volumeInfo?.title;
    const images = item?.volumeInfo?.imageLinks;
    return (
      <TouchableOpacity
        style={{
          justifyContent: "space-evenly",
          borderRadius: 10,
          borderWidth: 1,
          padding: 2,
          borderColor: "gray",
          alignItems: "center",
          marginVertical: 10,
          marginHorizontal: 10,
          flex: 1,
        }}
        onPress={() => handleBookPress(item)}
      >
        <Image
          resizeMode="cover"
          style={{ height: 150, width: "100%", borderRadius: 10 }}
          source={{ uri: images?.thumbnail }}
        />
        <Text numberOfLines={2} style={styles.bookName}>
          {bookName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    return (
      <View style={styles.renderEmptyView}>
        <Text>Oops No Data found</Text>
      </View>
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.mainContainer}>
        <Text style={styles.header1}>Welcome to books Nepal</Text>
        <View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              onFocus={() => {
                handleCategoryClose();
              }}
              onChangeText={(text) => debouncedSearch(text)}
              style={styles.input}
              placeholder="Search books"
            ></TextInput>
            <TouchableOpacity onPress={handleCategoryOpen}>
              <Ionicons name="filter-circle-outline" size={34} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {!loading && query === "" && !books?.length ? (
          <View style={styles.renderEmptyView}>
            <Text>Please search for the books</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator size={"large"} color={"green"} />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            numColumns={2}
            data={books}
            renderItem={renderBooks}
            ListEmptyComponent={renderEmptyList}
          />
        )}
        <CategorySheetModal
          bottomCategoryModalRef={bottomCategoryModalRef}
          setFilter={setFilter}
          handleCategoryClose={handleCategoryClose}
        />
        <BookDetailSheetModal
          bottomBookDetailModalRef={bottomBookDetailModalRef}
          bookDetail={bookDetail}
          rentedBooks={rentedBooks}
          returnBooks={returnBooks}
          rentBooks={rentBooks}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: 50,
    flex: 1,
  },
  header1: {
    textAlign: "center",
    marginVertical: 10,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  header: {
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    height: 40,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: "85%",
    alignSelf: "center",
    borderRadius: 10,
  },
  bookName: {
    paddingVertical: 5,
    letterSpacing: 2,
  },
  renderEmptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});