if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/chandanmallik/projects/ckrcrm/frontend-bdm/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/566x2g2v/obj/armeabi-v7a/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/chandanmallik/projects/ckrcrm/frontend-bdm/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

