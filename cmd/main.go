package main

import (
	"fmt"
	"log"
	_ "modernc.org/sqlite" // драйвер без CGO
	"oil-gas-service-booking/internal/config"
	"oil-gas-service-booking/internal/storage"
)

func main() {

	// мб фреймворком нужно подумать каким

	// примерный план
	// TODO init config (yaml нврн)
	cfg := config.MustLoad()
	fmt.Println(cfg)

	// TODO init logger: slog  (мб не надо)

	// TODO init storage: сначала sqlite потом перейду на postgresql

	// создаём стор (передаём cfg.Storage или строку "storage/storage.db")
	store, err := storage.NewStorage(cfg.Storage)
	if err != nil {
		log.Fatalf("new storage: %v", err)
	}
	defer store.Close()

	log.Println("DB ready")

	// TODO init router (вроде надо)

	// TODO run server
}
