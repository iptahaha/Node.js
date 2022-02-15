# Node.js
DevEducation Node.js homework

Используя Node.js, разработать сервис, принимающий файлы по протоколу
HTTP и загружающий в AWS S3. В случае, если принимаемый файл является
изображением, то перед отправкой в S3 изображение должно быть
преобразовано в указанные размеры.
Оригинал изображения сохранять не нужно. Размеров может быть несколько
(large - 2048x2048, medium - 1024x1024, thumb - 300x300). В качестве размеров
указаны максимально допустимые значения ширины и высоты.
Примечания:
1. готовый сервис должен быть развёрнут на Heroku/AWS/etc.;
2. сервис должен обслуживать только один endpoint: запрос на адрес вида
/{filename};
3. response = {
large: ‘http://’
medium: ‘s3://’
thumb: ‘s3://’
}
422: file to large
4. конфигурация сервиса должна производиться посредством переменных
окружения;
5. необходимо обеспечить возможность указания допустимых расширений
и допустимых типов файлов (Content-Type) (все прочие файлы сервис
должен отклонять);
6. необходимо обеспечить возможность указания максимального размера
файла 20 мб;
7. желательно покрытие кода тестами.
8. *не использовать multipart/form-data (в заголовках запроса будет указан
Content-Type: например, Content-Type: image/png);
9. *количество потребляемой сервисом оперативной памяти не должно
быть связано с размером загружаемого файла;
10. * подключить домен
